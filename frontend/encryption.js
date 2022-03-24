async function pbkdf2Test(){
    const username = document.getElementById("username-pbkdf2").value;
    const password = document.getElementById("password-pbkdf2").value;
    const masterKey = await genMasterKey(username, password);
    const masterKeyBase64 = bufferToBase64(await exportKey(masterKey));
    const authHash = await genAuthHash(masterKey, password);
    const vaultKey = await genVaultKey();
    const vaultKeyBase64 = bufferToBase64(await exportKey(vaultKey));
    const encVaultKey = await wrapKey(vaultKey, masterKey);
    const encVaultKeyBase64 = bufferToBase64(encVaultKey);
    const vaultKeyBase64Test = bufferToBase64(await exportKey(await unwrapVaultKey(encVaultKey, masterKey)));
    document.getElementById("pbkdf2-key").value = masterKeyBase64;
    console.log("Master key: " + masterKeyBase64 + "\nAuth hash: " + authHash + "\nVault key: " + vaultKeyBase64 + "\nEncrypted vault key: " + encVaultKeyBase64 + "\nUnencrypted vault key: " + vaultKeyBase64Test);
}

async function genMasterKey(username, password) {
    return getPbkdf2Key(username, password, 100000);
}

function genAuthHash(masterKey, password) {
    return getPbkdf2Key(password, masterKey, 1).then(key => {
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

async function getPbkdf2Key(salt, password, iterations) {
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

async function aesEncrypt(payload, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt(
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
        ["encrypt", "decrypt"]
    );
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