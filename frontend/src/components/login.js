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
    event.preventDefault();
    setRegister(false);
  };

  const onClickRegister = (event) => {
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

    if (!register) {
      return matchEmail.test(email) && password.length > 6;
    }
    return (
      matchEmail.test(email) &&
      password.length > 6 &&
      password === passwordConfirm
    );
  };

  const onSubmit = async () => {
    /*if(!validateInput()) {
      setFailed('There was a problem with your E-Mail!');
      return;
    }*/

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

        if(response.length === 3) {
          setFailed('Token response invalid! Error: ' + response);
          return;
        }
        login(response, email, password);
      }
    } catch (err) {
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
