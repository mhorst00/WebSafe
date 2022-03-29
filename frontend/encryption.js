export class encryptionModule {
    static authHash;
    static #USERNAME;
    static #PASSWORD;
    static #MASTERKEY;
    static #IV;
    static #VAULTKEY;
    static #DATAKEY;


    static  async initialise(username, password) {
        this.#USERNAME = username;
        this.#PASSWORD = password;
        this.#MASTERKEY = await genMasterKey(this.#USERNAME, this.#PASSWORD);
        this.#IV = genIv();
        this.#VAULTKEY = await genVaultKey();
        this.#DATAKEY = await genDataKey();
        this.authHash = await genAuthHash(this.#MASTERKEY, this.#PASSWORD);
    }

    static async importSafe(safe) {
        const encImportVaultKey = base64DecToArr(safe.enc_vault_key);
        const encImportDataKey = base64DecToArr(safe.enc_data_key);
        const safeImportPayload = base64DecToArr(safe.safe_payload);
        this.#IV = base64DecToArr(safe.iv);
        this.#VAULTKEY = await unwrapVaultKey(encImportVaultKey, this.#MASTERKEY);
        this.#DATAKEY = await unwrapDataKey(encImportDataKey, this.#VAULTKEY);
        return decryptSafe(safeImportPayload, this.#DATAKEY, this.#IV);
    }

    static async exportSafe(contentArray) {
        const contentEncrypted = await encryptSafe(contentArray, this.#DATAKEY, this.#IV);
        const dataKeyB64 = bufferToBase64(await wrapKey(this.#DATAKEY, this.#VAULTKEY));
        const vaultKeyB64 = bufferToBase64(await wrapKey(this.#VAULTKEY, this.#MASTERKEY));
        const ivB64 = bufferToBase64(this.#IV);
        return safe = { 
            "safe_payload":contentEncrypted,
            "enc_data_key":dataKeyB64,
            "enc_vault_key":vaultKeyB64,
            "iv":ivB64
        };
    }
}

async function genMasterKey(username, password) {
    return genPbkdf2Key(username, password, 100000);
}

async function genAuthHash(masterKey, password) {
    return genPbkdf2Key(password, masterKey, 1).then(key => {
        return exportKey(key);
    }).then( key => {
        return bufferToBase64(key);
    });
}

async function getPbkdf2Material(password) {
    var encoder = new TextEncoder('utf-8');
    var passphraseKey = encoder.encode(password);
    return crypto.subtle.importKey(
        'raw', 
        passphraseKey, 
        {name: 'PBKDF2'}, 
        false, 
        ['deriveBits', 'deriveKey']
    );
}

async function genPbkdf2Key(salt, password, iterations) {
    var encoder = new TextEncoder('utf-8');
    var saltBuffer = encoder.encode(salt);
    var key = await getPbkdf2Material(password);
    return crypto.subtle.deriveKey(
        { "name": 'PBKDF2',
        "salt": saltBuffer,
        "iterations": iterations,
        "hash": 'SHA-512'
        },
        key,
        { "name": 'AES-KW', "length": 256 },
        true,
        [ "wrapKey", "unwrapKey" ]
    );
}

async function aesEncrypt(payload, key, iv) {
    return crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
          },
          key,
          payload
    );
}

async function aesDecrypt(payload, key, iv) {
    return crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
          },
          key,
          payload
    );
}

async function genVaultKey() {
    return crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["wrapKey", "unwrapKey"]
    );
}

async function genDataKey() {
    return crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

function genIv() {
    return crypto.getRandomValues(new Uint8Array(12));
}

async function encryptSafe(payload, dataKey, iv) {
    const encBase64 = aesEncrypt(payload, dataKey);
    return bufferToBase64(encBase64, iv);
}

async function decryptSafe(payload, dataKey, iv) {
    const encBuffer = base64DecToArr(payload);
    return aesDecrypt(encBuffer, dataKey, iv);
}

async function exportKey(key) {
    const exported = await crypto.subtle.exportKey("raw", key);
    return new Uint8Array(exported);
}

async function wrapKey(payload, wrapper) {
    const wrappedKey = await crypto.subtle.wrapKey(
        "raw",
        payload,
        wrapper,
        "AES-KW"
    );
    return new Uint8Array(wrappedKey);
}

async function unwrapVaultKey(encVaultKey, masterKey) {
    return crypto.subtle.unwrapKey(
        "raw",
        encVaultKey,
        masterKey,
        "AES-KW",
        {
            name: "AES-GCM",
            length: 256
        },

        true,
        ["wrapKey", "unwrapKey"]
    );
}

async function unwrapDataKey(encDataKey, masterKey) {
    return crypto.subtle.unwrapKey(
        "raw",
        encDataKey,
        masterKey,
        "AES-KW",
        {
            name: "AES-GCM",
            length: 256
        },

        true,
        ["encrypt", "decrypt"]
    );
}

function bufferToBase64(buffer) {
    const binary = String.fromCharCode.apply(null, buffer);
    return window.btoa(binary);
}

function base64DecToArr (sBase64, nBlocksSize = 1) {
    var
      sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
      nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen); 
    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3;
      nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
          taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
        }
        nUint24 = 0;
  
      }
    }
    return taBytes;
}

function b64ToUint6 (nChr) {
    return nChr > 64 && nChr < 91 ?
        nChr - 65
      : nChr > 96 && nChr < 123 ?
        nChr - 71
      : nChr > 47 && nChr < 58 ?
        nChr + 4
      : nChr === 43 ?
        62
      : nChr === 47 ?
        63
      :
        0;
}