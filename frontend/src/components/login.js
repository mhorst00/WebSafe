import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { baseUrl, registerUser, loginUser, sendEmail } from "./api";
import { encryptionModule } from "../encryption";

import "./Login.css";

function Login() {
  const { login } = useContext(AuthContext);
  
  const [register, setRegister] = useState('login');
  const [failed, setFailed] = useState(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");


  const onClickLogin = (event) => {
    setPassword('');
    setFailed(undefined);
    event.preventDefault();
    setRegister('login');
  };

  const onClickRegister = (event) => {
    setPassword('');
    setFailed(undefined);
    event.preventDefault();
    setRegister('register');
  };

  const onClickPasswordForgotten = (event) => {
    setFailed(undefined);
    event.preventDefault();
    setRegister('forgotten');
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
    let message = "";

    if (password.length < 8 && register !== 'forgotten') {
      message = "Password must have at least 8 characters. ";
    }

    if (!matchEmail.test(email)) {
      message += "Not a valid email. ";
    }

    if (password !== passwordConfirm && register === 'register') {
      message += "Passwords are not equal.";
    }

    if (message.length > 1) {
      setFailed(message);
      return true;
    }
    return false;
  };

  const onSubmit = async () => {
    if (validateInput()) {
      return;
    }

    try {
      let response;
      await encryptionModule.initialise(email, password);
      if (register === 'register') {
        // User tries to register
        response = await registerUser(email, name, password);

        if (response === 200) {
          response = await loginUser(email, password);
          if (response.length === 3) {
            setFailed("Token response invalid! Error: " + response);
            return;
          }
          login(response);
        }
      } 
      if(register === 'login') {
        // User tries to log in
        response = await loginUser(email);
        if (response.length === 3) {
          setFailed("Token response invalid! Error: " + response);
          return;
        }
        login(response, email, password);
      }
      if(register === 'forgotten') {
        response = await sendEmail(email);
        setFailed(response);
      }
    } catch (err) {
      if(register === 'forgotten') {
        setFailed(err);
        return;
      }
      if(register === 'register') {
        setFailed(err);
        return;
      }
      setFailed("Wrong Password or E-Mail!");
    }
  };

  return (
    <div className="Login-Container">
      <div className="Login-Field">
        <h2>WebSafe</h2>
        {failed ?
            <><p className="Login-Failed-Text">{failed}</p> 
            {register === 'login' && <p className="Login-Failed-Text"><a href={baseUrl} onClick={onClickPasswordForgotten}>Password forgotten</a></p>}</>
            : 
            <p></p>
        }
        <div className="Login-Input">
          {register === 'register' && (
            <>
              <label className="Login-Password">Name</label>
              <input
                type="text"
                placeholder="Your Name"
                onInput={onInputName}
                onKeyDown={(event) => event.key === "Enter" && onSubmit()}
              />
            </>
          )}
          <label className="Login-Password">E-Mail</label>
          <input
            type="email"
            placeholder="example@example.com"
            onInput={onInputEmail}
            onKeyDown={(event) => event.key === "Enter" && onSubmit()}
          />
          {register !== 'forgotten' && (
            <>
              <label className="Login-Password">Password</label>
              <input
                value={password}
                type="password"
                placeholder="password"
                onInput={onInputPassword}
                onKeyDown={(event) => event.key === "Enter" && onSubmit()}
              />
           </>
          )}
          
          {register === 'register' && (
            <>
              <label className="Login-Password">Password confirm</label>
              <input
                type="password"
                placeholder="password"
                onInput={onInputPasswordConfirm}
                onKeyDown={(event) => event.key === "Enter" && onSubmit()}
              />
            </>
          )}

          <button className="Login-Button" onClick={onSubmit}>
            {register === 'register' && 'Register'}
            {register === 'login' && 'Login'}
            {register === 'forgotten' && 'Send E-Mail'}
          </button>
          {register === 'register' && (
            <p className="Login-Info-Text">
              You already have an Account?{" "}
              <a href={baseUrl} onClick={onClickLogin}>
                Login
              </a>
            </p>
          )} 
          {register === 'login' && (
            <p className="Login-Info-Text">
              You don't have an Account?{" "}
              <a href={baseUrl} onClick={onClickRegister}>
                Register
              </a>
            </p>
          )}
          {register === 'forgotten' && (
            <p className="Login-Info-Text">
              You can remember your account?{" "}
              <a href={baseUrl} onClick={onClickLogin}>
                Login
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
