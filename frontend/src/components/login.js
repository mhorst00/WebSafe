import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { baseUrl, registerUser, loginUser } from "./api";
import { encryptionModule } from "../encryption";

import "./Login.css";


function Login() {
  const [register, setRegister] = useState(false);
  const [failed, setFailed] = useState(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { login } = useContext(AuthContext);

  const onClickLogin = (event) => {
    setFailed(undefined);
    event.preventDefault();
    setRegister(false);
  };

  const onClickRegister = (event) => {
    setFailed(undefined);
    event.preventDefault();
    setRegister(true);
  };

  const onInputName = (event) => {
    setName(event.target.value);
  };

  const onInputEmail = (event) => {
    setEmail(event.target.value);
  };

  const onInputPassword = (event) => {
    setPassword(event.target.value);
  };

  const onInputPasswordConfirm = (event) => {
    setPasswordConfirm(event.target.value);
  };

  const validateInput = () => {
    let matchEmail = /\S+@\S+\.\S+/;
    let message = '';

    if(password.length < 8) {
      message = 'Password must have at least 8 characters. '
    }

    if(!matchEmail.test(email)) {
      console.log('emaiol falsch');
      message += 'Not a valid email. '; 
    }

    if(password !== passwordConfirm && register) {
      message += 'Passwords are not equal.'; 
    }

    if(message.length > 1) {
      console.log(message);
      setFailed(message);
      return true;
    }
    return false;
  };

  const onSubmit = async () => {
    if(validateInput()) {
      return;
    }

    try {
      let response;
      console.log('Variablen: ' + email + ' ' + password);
      await encryptionModule.initialise(email, password);
      if (register) {
        // User tries to register
        response = await registerUser(email, name, password);

        if(response === 200) {
          response = await loginUser(email, password);
          if(response.length === 3) {
            setFailed('Token response invalid! Error: ' + response);
            return;
          }
          login(response);
        } 
      } else {
        // User tries to log in
        response = await loginUser(email, password);
        console.log('response sdjkhbcnnks   ' + response);
        if(response.length === 3) {
          console.log('error anmeldung');
          setFailed('Token response invalid! Error: ' + response);
          return;
        }
        login(response, email, password);
      }
    } catch (err) {
      console.log('error anmeldung');
      setFailed("Wrong Password or E-Mail!");
    }
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
                onInput={onInputName}
              />
            </>
          )}
          <label className="Login-Password">E-Mail</label>
          <input
            type="email"
            placeholder="example@example.com"
            onInput={onInputEmail}
          />
          <label className="Login-Password">Password</label>
          <input
            type="password"
            placeholder="password"
            onInput={onInputPassword}
          />
          {register && (
            <>
              <label className="Login-Password">Password confirm</label>
              <input
                type="password"
                placeholder="password"
                onInput={onInputPasswordConfirm}
              />
            </>
          )}

          <button className="Login-Button" onClick={onSubmit}>
            {register ? "Register" : "Login"}
          </button>
          {register ? (
            <p className="Login-Info-Text">
              You already have an Account?{" "}
              <a href={baseUrl} onClick={onClickLogin}>
                Login
              </a>
            </p>
          ) : (
            <p className="Login-Info-Text">
              You don't have an Account?{" "}
              <a
                href={baseUrl}
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
