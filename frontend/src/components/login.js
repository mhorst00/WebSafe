import { useState, useContext } from 'react';
import './Login.css';
import { AuthContext } from '../context/AuthContext';
 
function Login() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const {login} = useContext(AuthContext);
  
  const onClickLogin = (event) => {
      event.preventDefault();
      setRegister(false);
  }

  const onClickRegister = (event) => {
    event.preventDefault();
    setRegister(true);
  }

  const onChangeEmail = (event) => {
    setEmail(event.target.value)
  }

  const onChangePassword = (event) => {
    setPassword(event.target.value)
  }

  const onChangePasswordConfirm = (event) => {
    setPasswordConfirm(event.target.value)
  }

  const validateInput = () => {
      if(!register) {
        return email.length > 3 && password.length > 0;
      }
      return email.length > 3 && password.length > 0 && password === passwordConfirm;
  }

  const onSubmit = () => {
    //if(!validateInput()) return;

    if(register) {
        console.log('API-CALL {' + email + password + passwordConfirm + '}');
        

    } else {
        console.log('API-CALL {' + email + password + '}');
        login();
    }
  }

  return (
      <div className='Login-Container'>
        <div className="Login-Field">
        <h2>WebSafe</h2>
        <div className='Login-Input'>
            <label>E-Mail</label>
            <input type='email' placeholder='example@example.com' onChange={onChangeEmail}/>
            <label className='Login-Password'>Password</label>
            <input type='password' placeholder='password' onChange={onChangePassword}/>
            {register && (
                <>
                    <label className='Login-Password'>Password confirm</label>
                    <input type='password' placeholder='password' onChange={onChangePasswordConfirm}/>
                </>
            )}

            <button className='Login-Button' onClick={onSubmit}>{register? "Register" : "Login"}</button>
            {register ? (
                <p className='Login-Info-Text'>You already have an Account? <a href='' onClick={onClickLogin}>Login</a></p>
            ) : (
                <p className='Login-Info-Text'>You don't have an Account? <a href='' onClick={onClickRegister}>Register</a></p>
            )}
        </div>
        </div>
    </div>
  );
}

export default Login;