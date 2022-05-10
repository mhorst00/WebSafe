import { encryptionModule } from "../encryption";

export const baseUrl = `${process.env.REACT_APP_DOMAIN}/api/v1`;

export function authorizedRequest(method, url, token) {
  let request = new XMLHttpRequest();
  request.open(method, baseUrl + url);
  request.setRequestHeader("Accept", "application/json");
  if (token != null) {
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Bearer " + token);
  }

  return request;
}

export function registerUser(email, name) {
  return new Promise(function (resolve, reject) {
    let request = authorizedRequest("POST", "/user/new");
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function () {
      if (request.status === 200) {
        resolve(request.status);
      } else {
        console.log("Error with call:" + request.responseText);
        reject(JSON.parse(request.responseText).message);
      }
    };
    request.onerror = function () {
      console.log("Error with call:" + request.responseText);
      reject(JSON.parse(request.responseText).message);
    };
    request.send(
      JSON.stringify({
        username: email,
        full_name: name,
        password: encryptionModule.authHash,
      })
    );
  });
}

export function loginUser(email) {
  return new Promise(function (resolve, reject) {
    let request = authorizedRequest("POST", "/token");
    request.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    request.onload = function () {
      if (request.status === 200) {
        resolve(JSON.parse(request.response).access_token);
      } else {
        reject(request.status);
      }
    };
    request.onerror = function () {
      console.log("Error with call:" + request.responseText);
      reject(request.status);
    };
    request.send(
      "grant_type=&username=" +
        email +
        "&password=" +
        encodeURIComponent(encryptionModule.authHash) +
        "&scope=&client_id=&client_secret="
    );
  });
}

function isSafeImportable(payload) {
  if (payload === "") {
    return false;
  }
  if (payload.safe_payload === "") {
    return false;
  }
  if (payload.safe_payload === "") {
    return false;
  }
  if (payload.enc_data_key === "") {
    return false;
  }
  if (payload.enc_vault_key === "") {
    return false;
  }
  if (payload.data_iv === "") {
    return false;
  }
  if (payload.vault_iv === "") {
    return false;
  }
  return true;
}

export async function getSafe(token) {
  return new Promise(function (resolve, reject) {
    let request = authorizedRequest("GET", "/safe", token);
    request.onload = function () {
      if (request.status === 200) {
        //sollte als JSON objekt übergeben
        let safe = JSON.parse(request.responseText);
        if (isSafeImportable(safe)) {
          let decryptedSafe = encryptionModule.importSafe(safe);
          resolve(decryptedSafe);
        } else {
          resolve([]);
        }
      }
    };
    request.onerror = function () {
      console.log("Error with call:" + request.responseText);
      reject(request.status);
    };
    request.send();
  });
}

export async function getUserName(authState) {
  return new Promise(function (resolve, reject) {
    let request = authorizedRequest("GET", "/user/me", authState);
    request.onload = function () {
      if (request.status === 200) {
        resolve(JSON.parse(request.responseText).full_name);
      } else {
        console.log("Error with call:" + request.responseText);
        reject(request.status);
      }
    };
    request.onerror = function () {
      console.log("Error with call:" + request.responseText);
      reject(request.status);
    };
    request.send();
  });
}

export async function sendSafe(entrys, authState) {
  return new Promise(async function (resolve, reject) {
    const exportPayload = await encryptionModule.exportSafe(entrys);

    let request = authorizedRequest("POST", "/safe", authState);
    request.onload = function () {
      if (request.status === 200) {
        resolve(true);
      } else {
        console.log("Error with call:" + request.responseText);
        reject(false);
      }
    };
    request.onerror = function () {
      reject(false);
    };
    request.send(JSON.stringify(exportPayload));
  });
}

export async function sendEmail(email) {
  return new Promise(async function (resolve, reject) {
    let request = authorizedRequest("POST", "/user/delete/pass_forgotten");
    request.setRequestHeader(
      "Content-Type",
      "application/json"
    );
    request.onload = function () {
      if (request.status === 200) {
        resolve(JSON.parse(request.responseText).message);
      } else {
        reject(JSON.parse(request.responseText).message);
      }
    };
    request.onerror = function () {
      console.log("Error with call:" + request.responseText);
      reject(request.status);
    };
    request.send(
      JSON.stringify({username: email})
    );
  });
}