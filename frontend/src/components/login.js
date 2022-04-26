import { useState, useContext } from "react";
import "./Login.css";
import { AuthContext } from "../context/AuthContext";
import { encryptionModule } from "../encryption";

const baseUrl = "https://gruppe4.testsites.info/api/v1";

function isSafeImportable(payload) {
  if (payload == "") {
    return false;
  }
  if (payload.safe_payload == "") {
    return false;
  }
  if (payload.safe_payload == "") {
    return false;
  }
  if (payload.enc_data_key == "") {
    return false;
  }
  if (payload.enc_vault_key == "") {
    return false;
  }
  if (payload.data_iv == "") {
    return false;
  }
  if (payload.vault_iv == "") {
    return false;
  }
  return true;
}

function getRequest(method, url, token) {
  let request = new XMLHttpRequest();
  request.open(method, baseUrl + url);
  request.setRequestHeader("Accept", "application/json");
  if (token != null) {
    request.setRequestHeader("Authorization", "Bearer " + token);
  }
  return request;
}

function registerUser(email, name, password) {
  return new Promise(function (resolve, reject) {
    let request = getRequest("POST", "/user/new");
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function () {
      if (request.status === 200) {
        resolve(request.status);
      } else {
        window.alert("Error with call:" + request.responseText);
        console.log("Error with call:" + request.responseText);
        reject(request.status);
      }
    };
    request.onerror = function () {
      window.alert("Error with call:" + request.responseText);
      console.log("Error with call:" + request.responseText);
      reject(request.status);
    };
    request.send(
      JSON.stringify({
        username: email,
        full_name: name,
        password: password,
      })
    );
  });
}

function loginUser(email, password) {
  return new Promise(function (resolve, reject) {
    let request = getRequest("POST", "/token");
    request.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    request.onload = function () {
      if (request.status == 200) {
        resolve(JSON.parse(request.response).access_token);
      } else {
        window.alert("Error with call:" + request.responseText);
        console.log("Error with call:" + request.responseText);
        reject(request.status);
      }
    };
    request.onerror = function () {
      window.alert("Error with call:" + request.responseText);
      console.log("Error with call:" + request.responseText);
      reject(request.status);
    };
    request.send(
      "grant_type=&username=" +
        email +
        "&password=" +
        password +
        "&scope=&client_id=&client_secret="
    );
  });
}

export async function getSafe(token, email, password) {
  return new Promise(function (resolve, reject) {
    let request = getRequest("GET", "/safe", token);
    request.onload = function () {
      if (request.status == 200) {
        //sollte als JSON objekt übergeben
        let safe = JSON.parse(request.responseText);
        if (isSafeImportable(safe)) {
          let decryptedSafe = encryptionModule.importSafe(safe);
          resolve(decryptedSafe);
        } else {
          console.log(
            "safe was not importable, trying to log in otherwise: ",
            email,
            password
          );
          encryptionModule.initialise(email, password);
          request.send();
        }
      } else {
        window.alert("Error with call:" + request.responseText);
        console.log("Error with call:" + request.responseText);
      }
    };
    request.onerror = function () {
      window.alert("Error with call:" + request.responseText);
      console.log("Error with call:" + request.responseText);
      reject(request.status);
    };
    request.send();
  });
}

function Login() {
  const [register, setRegister] = useState(false);
  const [failed, setFailed] = useState(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("a@b.com");
  const [password, setPassword] = useState("test");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { login } = useContext(AuthContext);

  const onClickLogin = (event) => {
    event.preventDefault();
    setRegister(false);
  };

  const onClickRegister = (event) => {
    event.preventDefault();
    setRegister(true);
  };

  const onChangeName = (event) => {
    setName(event.target.value);
  };

  const onChangeEmail = (event) => {
    setEmail(event.target.value);
  };

  const onChangePassword = (event) => {
    setPassword(event.target.value);
  };

  const onChangePasswordConfirm = (event) => {
    setPasswordConfirm(event.target.value);
  };

  const validateInput = () => {
    let matchEmail = /\S+@\S+\.\S+/;

    if (!register) {
      return matchEmail.test(email) && password.length > 6;
    }
    return (
      matchEmail.test(email) &&
      password.length > 6 &&
      password === passwordConfirm
    );
  };

  const onSubmit = () => {
    /*
    if(!validateInput()) {
      setFailed('There was a problem with your E-Mail!');
      return;
    }
    */

    try {
      if (register) {
        // User tries to register
        registerUser(email, name, password).then((stat) => {
          if (stat === 200) {
            encryptionModule.initialise(email, password);
            loginUser(email, password).then((token) => {
              if (token.length == 3) {
                console.log("tolle fehlerbehandlung kommt noch");
              } else {
                login(token);
              }
            });
          } else {
            console.log("tolle fehlerbehandlung kommt noch");
          }
        });
      } else {
        // User tries to log in
        loginUser(email, password).then(async (token) => {
          if (token.length == 3) {
            console.log("tolle fehlerbehandlung kommt noch");
          } else {
            await encryptionModule.initialise(email, password);
            login(token, email, password);
          }
        });
      }
    } catch (err) {
      setFailed("Wrong Password or E-Mail!");
    }
    setEmail("");
    setPassword("");
  };

  return (
    <div className="Login-Container">
      <div className="Login-Field">
        <h2>WebSafe</h2>
        {failed ? <p className="Login-Failed-Text">{failed}</p> : <p></p>}
        <div className="Login-Input">
          {register && (
            <>
              <label className="Login-Password">Name</label>
              <input
                type="text"
                placeholder="Your Name"
                onChange={onChangeName}
              />
            </>
          )}
          <label className="Login-Password">E-Mail</label>
          <input
            type="email"
            placeholder="example@example.com"
            onChange={onChangeEmail}
          />
          <label className="Login-Password">Password</label>
          <input
            type="password"
            placeholder="password"
            onChange={onChangePassword}
          />
          {register && (
            <>
              <label className="Login-Password">Password confirm</label>
              <input
                type="password"
                placeholder="password"
                onChange={onChangePasswordConfirm}
              />
            </>
          )}

          <button className="Login-Button" onClick={onSubmit}>
            {register ? "Register" : "Login"}
          </button>
          {register ? (
            <p className="Login-Info-Text">
              You already have an Account?{" "}
              <a href="https://gruppe4.testsites.info/" onClick={onClickLogin}>
                Login
              </a>
            </p>
          ) : (
            <p className="Login-Info-Text">
              You don't have an Account?{" "}
              <a
                href="https://gruppe4.testsites.info/"
                onClick={onClickRegister}
              >
                Register
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
