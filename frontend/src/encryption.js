/*
This file is part of WebSafe and has been contributed by https://github.com/mhorst00.

WebSafe is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
    // This function initalises the module with username and password,
    // these are then used to generate all necessary keys using other functions
    // in this module.
    if (typeof username !== "string" || typeof password !== "string") {
      throw new TypeError(
        "Initialisation of encryptionModule failed because of type errors in username or password."
      );
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
    // Takes a JSON object encoded in base64 received from the API, decrypts it
    // using generated keys in module and returns an array of JSON objects
    // each containing one safe entry of the user.
    if (
      typeof safe.enc_vault_key !== "string" ||
      typeof safe.enc_data_key !== "string" ||
      typeof safe.data_iv !== "string" ||
      typeof safe.vault_iv !== "string"
    ) {
      throw new TypeError("Type error while importing safe object.");
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
    // Takes an array of JSON objects from the frontend. Then it encrypts
    // this array and all relevant keys for export and encodes the data
    // in base64. These strings are returned in a JSON.
    if (!Array.isArray(contentArray)) {
      throw new TypeError(
        "Type error in exportSafe: Passed object is not an array."
      );
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
  // Generates master key from username and password
  return genPbkdf2Key(username, password, 100000);
}

async function genAuthHash(masterKey, password) {
  // Generates PBKDF2 authentication hash in base64 from master key and password
  // This is used to authenticate with the API instead of a password.
  return genPbkdf2Key(password, masterKey, 1)
    .then((key) => {
      return exportKey(key);
    })
    .then((key) => {
      return bufferToBase64(key);
    });
}

async function getPbkdf2Material(password) {
  // Imports key user password and converts it to a CryptoKey object.
  // This is used by WebCrypto API for all further operations.
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
  // Generates a PBKDF2 key with given variables using WebCrypto API.
  // Reference: https://de.wikipedia.org/wiki/PBKDF2
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
  // Encrypts a ArrayBuffer object of any content using the given key
  // with AES-GCM and WebCrypto API. Returns encrypted object as ArrayBuffer.
  // Reference: https://de.wikipedia.org/wiki/Galois/Counter_Mode
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
  // Decrypts a ArrayBuffer object of any content using the given key
  // with AES-GCM and WebCrypto API. Returns promise of ArrayBuffer.
  // Reference: https://de.wikipedia.org/wiki/Galois/Counter_Mode
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
  // Generates vault key of user with AES-GCM using WebCrypto API.
  // Reference: https://de.wikipedia.org/wiki/Galois/Counter_Mode
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
  // Generates data key used to encrypt safe with AES-GCM using WebCrypto API.
  // Reference: https://de.wikipedia.org/wiki/Galois/Counter_Mode
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
  // Generates a random initialisation vector using WebCrypto's random
  // number generator. Returns ArrayBuffer.
  return crypto.getRandomValues(new Uint8Array(16));
}

async function encryptSafe(payload, dataKey, iv) {
  // Encrypts a user's safe using their data key with AES.
  // payload has to be a ArrayBuffer object.
  // Returns base64 string of encrypted content.
  const obj = JSON.stringify(payload);
  const bufferObj = new TextEncoder().encode(obj);
  const encBase64 = await aesEncrypt(bufferObj, dataKey, iv);
  return bufferToBase64(encBase64);
}

async function decryptSafe(payload, dataKey, iv) {
  // Decrypts a user's safe using their data key with AES.
  // payload has to be a ArrayBuffer object.
  // Returns an array of JSON objects containing safe entries.
  const buffer = new Uint8Array(await aesDecrypt(payload, dataKey, iv));
  const decodedBuffer = new TextDecoder().decode(buffer);
  return JSON.parse(decodedBuffer);
}

async function exportKey(key) {
  // Exports a WebCrypto CryptoKey object to a ArrayBuffer object.
  // Needed to make a hashed CryptoKey readable outside of WebCrypto.
  const exported = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(exported);
}

async function wrapVaultKey(payload, wrapper) {
  // Wraps the user's vault key to safely export it in an encrypted way.
  // Takes CryptoKey object, returns a ArrayBuffer object.
  // Reference: https://en.wikipedia.org/wiki/Key_wrap
  const wrappedKey = await crypto.subtle.wrapKey(
    "raw",
    payload,
    wrapper,
    "AES-KW"
  );
  return new Uint8Array(wrappedKey);
}

async function wrapDataKey(payload, wrapper, iv) {
  // Wraps the user's data key to safely export it in an encrypted way.
  // Takes CryptoKey object, returns a ArrayBuffer object.
  // Reference: https://en.wikipedia.org/wiki/Key_wrap
  const wrappedKey = await crypto.subtle.wrapKey("raw", payload, wrapper, {
    name: "AES-GCM",
    iv: iv,
  });
  return new Uint8Array(wrappedKey);
}

async function unwrapVaultKey(encVaultKey, masterKey) {
  // Unwraps the user's vault key to safely export it in an encrypted way.
  // Takes CryptoKey object, returns a ArrayBuffer object.
  // Reference: https://en.wikipedia.org/wiki/Key_wrap
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
  // Unwraps the user's data key to safely export it in an encrypted way.
  // Takes CryptoKey object, returns a ArrayBuffer object.
  // Reference: https://en.wikipedia.org/wiki/Key_wrap
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
  // Takes a ArrayBuffer object and converts it to a base64 encoded string
  const binary = String.fromCharCode.apply(null, buffer);
  return window.btoa(binary);
}

function base64DecToArr(sBase64, nBlocksSize = 1) {
  // Takes a bas64 encoded string and converts it to a ArrayBuffer object.
  // Uses Mozilla example because of Unicode problems in Javascript.
  // Source: https://developer.mozilla.org/en-US/docs/Glossary/Base64
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
  // Source: https://developer.mozilla.org/en-US/docs/Glossary/Base64
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
