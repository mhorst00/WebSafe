export class encryptionModule {
  static authHash;
  static #USERNAME;
  static #PASSWORD;
  static #MASTERKEY;
  static #DATAIV;
  static #VAULTIV;
  static #VAULTKEY;
  static #DATAKEY;

  static async initialise(username, password) {
    if (typeof username !== "string" || typeof password !== "string") {
      window.alert(
        "Initialisation of encryptionModule failed because of type errors."
      );
      return;
    }
    this.#USERNAME = username;
    this.#PASSWORD = password;
    this.#MASTERKEY = await genMasterKey(this.#USERNAME, this.#PASSWORD);
    this.#DATAIV = genIv();
    this.#VAULTIV = genIv();
    this.#VAULTKEY = await genVaultKey();
    this.#DATAKEY = await genDataKey();
    this.authHash = await genAuthHash(this.#MASTERKEY, this.#PASSWORD);
  }

  static async importSafe(safe) {
    if (
      typeof safe.enc_vault_key !== "string" ||
      typeof safe.enc_data_key !== "string" ||
      typeof safe.data_iv !== "string" ||
      typeof safe.vault_iv !== "string"
    ) {
      window.alert("Type error while importing safe object.");
      return;
    }
    const encImportVaultKey = base64DecToArr(safe.enc_vault_key);
    const encImportDataKey = base64DecToArr(safe.enc_data_key);
    const safeImportPayload = base64DecToArr(safe.safe_payload);
    this.#DATAIV = base64DecToArr(safe.data_iv);
    this.#VAULTIV = base64DecToArr(safe.vault_iv);
    this.#VAULTKEY = await unwrapVaultKey(encImportVaultKey, this.#MASTERKEY);
    this.#DATAKEY = await unwrapDataKey(
      encImportDataKey,
      this.#VAULTKEY,
      this.#VAULTIV
    );
    return decryptSafe(safeImportPayload, this.#DATAKEY, this.#DATAIV);
  }

  static async exportSafe(contentArray) {
    console.log("export safe");
    if (!Array.isArray(contentArray)) {
      window.alert("Type error in exportSafe: Passed object is not an array.");
      return;
    }
    const contentEncrypted = await encryptSafe(
      contentArray,
      this.#DATAKEY,
      this.#DATAIV
    );
    const dataKeyB64 = bufferToBase64(
      await wrapDataKey(this.#DATAKEY, this.#VAULTKEY, this.#VAULTIV)
    );
    const vaultKeyB64 = bufferToBase64(
      await wrapVaultKey(this.#VAULTKEY, this.#MASTERKEY)
    );
    const dataIvB64 = bufferToBase64(this.#DATAIV);
    const vaultIvB64 = bufferToBase64(this.#VAULTIV);
    return {
      safe_payload: contentEncrypted,
      enc_data_key: dataKeyB64,
      enc_vault_key: vaultKeyB64,
      data_iv: dataIvB64,
      vault_iv: vaultIvB64,
    };
  }

  static clearKeys() {
    this.#DATAIV = "";
    this.#VAULTIV = "";
    this.#DATAKEY = "";
    this.#VAULTKEY = "";
  }
}

async function genMasterKey(username, password) {
  return genPbkdf2Key(username, password, 100000);
}

async function genAuthHash(masterKey, password) {
  return genPbkdf2Key(password, masterKey, 1)
    .then((key) => {
      return exportKey(key);
    })
    .then((key) => {
      return bufferToBase64(key);
    });
}

async function getPbkdf2Material(password) {
  var encoder = new TextEncoder("utf-8");
  var passphraseKey = encoder.encode(password);
  return crypto.subtle.importKey(
    "raw",
    passphraseKey,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

async function genPbkdf2Key(salt, password, iterations) {
  var encoder = new TextEncoder("utf-8");
  var saltBuffer = encoder.encode(salt);
  var key = await getPbkdf2Material(password);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: iterations,
      hash: "SHA-256",
    },
    key,
    { name: "AES-KW", length: 256 },
    true,
    ["wrapKey", "unwrapKey"]
  );
}

async function aesEncrypt(payload, key, iv) {
  let buffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    payload
  );
  return new Uint8Array(buffer);
}

async function aesDecrypt(payload, key, iv) {
  return crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    payload
  );
}

async function genVaultKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["wrapKey", "unwrapKey"]
  );
}

async function genDataKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

function genIv() {
  return crypto.getRandomValues(new Uint8Array(16));
}

async function encryptSafe(payload, dataKey, iv) {
  const obj = JSON.stringify(payload);
  const bufferObj = new TextEncoder().encode(obj);
  const encBase64 = await aesEncrypt(bufferObj, dataKey, iv);
  return bufferToBase64(encBase64);
}

async function decryptSafe(payload, dataKey, iv) {
  const buffer = new Uint8Array(await aesDecrypt(payload, dataKey, iv));
  const decodedBuffer = new TextDecoder().decode(buffer);
  return JSON.parse(decodedBuffer);
}

async function exportKey(key) {
  const exported = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(exported);
}

async function wrapVaultKey(payload, wrapper) {
  const wrappedKey = await crypto.subtle.wrapKey(
    "raw",
    payload,
    wrapper,
    "AES-KW"
  );
  return new Uint8Array(wrappedKey);
}

async function wrapDataKey(payload, wrapper, iv) {
  const wrappedKey = await crypto.subtle.wrapKey("raw", payload, wrapper, {
    name: "AES-GCM",
    iv: iv,
  });
  return new Uint8Array(wrappedKey);
}

async function unwrapVaultKey(encVaultKey, masterKey) {
  return crypto.subtle.unwrapKey(
    "raw",
    encVaultKey,
    masterKey,
    "AES-KW",
    "AES-GCM",
    true,
    ["wrapKey", "unwrapKey"]
  );
}

async function unwrapDataKey(encDataKey, masterKey, iv) {
  return crypto.subtle.unwrapKey(
    "raw",
    encDataKey,
    masterKey,
    {
      name: "AES-GCM",
      iv: iv,
    },
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

function bufferToBase64(buffer) {
  const binary = String.fromCharCode.apply(null, buffer);
  return window.btoa(binary);
}

function base64DecToArr(sBase64, nBlocksSize = 1) {
  var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
    nInLen = sB64Enc.length,
    nOutLen = nBlocksSize
      ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
      : (nInLen * 3 + 1) >> 2,
    taBytes = new Uint8Array(nOutLen);
  for (
    var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0;
    nInIdx < nInLen;
    nInIdx++
  ) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4));
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
      }
      nUint24 = 0;
    }
  }
  return taBytes;
}

function b64ToUint6(nChr) {
  return nChr > 64 && nChr < 91
    ? nChr - 65
    : nChr > 96 && nChr < 123
    ? nChr - 71
    : nChr > 47 && nChr < 58
    ? nChr + 4
    : nChr === 43
    ? 62
    : nChr === 47
    ? 63
    : 0;
}
