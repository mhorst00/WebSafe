import { useState, useContext } from 'react';
import './Login.css';
import { AuthContext } from '../context/AuthContext';
 
function Login() {
  const [register, setRegister] = useState(false);
  const [failed, setFailed] = useState(undefined);
  const [name, setName] = useState('');
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

  const onChangeName = (event) => {
    setName(event.target.value);
  }

  const onChangeEmail = (event) => {
    setEmail(event.target.value);
  }

  const onChangePassword = (event) => {
    setPassword(event.target.value);
  }

  const onChangePasswordConfirm = (event) => {
    setPasswordConfirm(event.target.value);
  }

  const validateInput = () => {
    let matchEmail = /\S+@\S+\.\S+/;
    if(!register) {
      return matchEmail.test(email) && password.length > 6;
    }
    return matchEmail.test(email) && password.length > 6 && password === passwordConfirm;
  }

  const onSubmit = () => {
    /*
    if(!validateInput()) {
      setFailed('There was a problem with your E-Mail!');
      return;
    }
    */ 

    try {
      if(register) {
        console.log('API-CALL {' + name + email + password + passwordConfirm + '}');
      } else {
        console.log('API-CALL {' + email + password + '}');
        login();
      }
    } catch (err) {
      setFailed('Wrong Password or E-Mail!');
    }
    setEmail('');
    setPassword('');
  }

  return (
    <div className='Login-Container'> 
      <div className="Login-Field"> 
        <h2>WebSafe</h2>
        {failed ? (<p className='Login-Failed-Text'>{failed}</p>) : (<p></p>)}
        <div className='Login-Input'>
            {register && (
                <>
                    <label className='Login-Password'>Name</label>
                    <input type='password' placeholder='Your Name' onChange={onChangeName}/>
                </>
            )}
            <label className='Login-Password'>E-Mail</label>
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
                <p className='Login-Info-Text'>You already have an Account? <a href='https://gruppe4.testsites.info/' onClick={onClickLogin}>Login</a></p>
            ) : (
                <p className='Login-Info-Text'>You don't have an Account? <a href='https://gruppe4.testsites.info/' onClick={onClickRegister}>Register</a></p>
            )}
        </div>
      </div>
    </div>
  );
}

export default Login;