function gen_master_key(username, password) {
    let enc = new TextEncoder();
    function get_key_material() {
        return window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            "PBKDF2",
            false,
            ["encrypt", "decrypt"]
        );
    }
    let key_material = await get_key_material();
    let key = await window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            "salt": username,
            "iterations": 100000,
            "hash": "SHA-256"
        },
        key_material,
        { "name": "AES"}
    )
}