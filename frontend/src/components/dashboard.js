import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

function copyStringToClipboard(str) {
  document.activeElement.blur();
  if(!str) return;
  var el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style = {position: 'absolute', left: '-9999px'};
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function redirect(url) {
  document.activeElement.blur()
  if(!url) return;
  var a = document.createElement('a'); 
  a.setAttribute('readonly', '');
  a.style = {position: 'absolute', left: '-9999px'};
  a.target="_blank";
  a.rel="noreferrer";
  a.href=url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


function Dashboard() {
  const {logout} = useContext(AuthContext);
  const [settings, setSettings] = useState(false);
  const [entrys, setEntrys] = useState([]);

  const [link, setLink] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [reset, setReset] = useState('');

  const onChangeLink = (event) => {
    setLink(event.target.value);
  }

  const onChangeEmail = (event) => {
    setEmail(event.target.value);
  }

  const onChangePassword = (event) => {
    setPassword(event.target.value);
  }

  const onChangeReset = (event) => {
    setReset(event.target.value);
  } 



  const newEntry = () => {
    setEntrys([...entrys, {link, email, password}]);
    
    setLink('');
    setEmail('');
    setPassword('');
  }

  const deleteEntry = (deleteIndex) => {
    const entrysCopy = entrys;
    setEntrys([...entrysCopy.slice(0, deleteIndex),
      ...entrysCopy.slice(deleteIndex+ 1)]);
  }



  const changeAccount = () => {
    console.log('Change: ' + reset);
  }

  const deleteAccount = () => {

  }

  return (
    <div className='Dashboard'>
      {settings ? (
        <div className="Dashboard-Settings-Dialog">
          <div className='Dashboard-Settings-TopLane'> 
            <div className='Dashboard-Settings-Container-Topic'>
              <h3 className='Settings-Container-Topic'>Settings</h3>
            </div>
            
          </div>
          <div className='Account-Container'>
            <div className="close-button-container" data-closable>
              <button className="close-button" aria-label="Close alert" type="button" onClick={() => setSettings(false)} data-close>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className='margin-kante'>
            <label>Change account details:</label>
            </div>
            <div className='Account-Changer'>
              <div>
                <select className='Select-Data'>
                  <option>E-Mail</option>
                  <option>Password</option>
                </select>
              </div>
              <div>
                <input type='text' placeholder='Your change' onChange={onChangeReset}/>
              </div>    
              <div className='Account-Changer-Save'>
                <button className='Save-Button' onClick={changeAccount}>Save</button>
              </div>
            </div>
            <div className='Account-Changer-Delete'>
              <label>Delete  your Account Permantly:</label>
              <button className='Delete-Button' onClick={deleteAccount}>Delete your Account</button>
            </div>
          </div>
        </div> 
      ) : (
        <>
        </>
      )}
      <div className='stick-top'>

     
        <div className='Dashboard-TopLane'>
            <div className='Dashboard-Topic-Container'>
                <h2 className='Dashboard-Topic'>Dashboard</h2>
            </div>
            <div className="Dashboard-Settings-Container">
              <img src={'./settings.svg'} className="Dashboard-Settings" alt="logo" onClick={() => setSettings(true)}/>
            </div>
            <img src={'./logout-black.svg'} className="Dashboard-Logout" alt="logo" onClick={() => logout()}/>  
        </div>

        <div className='Dashboard-NewAccount'>
          <div className='Dashboard-NewAccount-Entry'>
              <div className='Dashboard-Entry-Link'>
                <label>Link:</label>
                <input type='text' value={link} placeholder='www.example.com' onChange={onChangeLink}/>
              </div>
              <div className='Dashboard-Entry-Email'>
                <label>E-Mail:</label>
                <input type='email' value={email} placeholder='example@example.com' onChange={onChangeEmail}/>
              </div>
              <div className='Dashboard-Entry-Password'>
                <label>Password:</label>
                <input type='password' value={password} placeholder='password' onChange={onChangePassword}/>
              </div>
              <div className='Dashboard-Entry-Save'>
                <button className='Save-Button' onClick={newEntry}>Save</button>
              </div>
          </div>
        </div>
        </div>

        <div className='Dashboard-Password'>
         {entrys.map((x, i) => {
           let aLink = '';
           if(x.link[0] === 'w') {
             aLink = 'https://';
           }
           aLink += x.link;

           return <div key={i} className='Dashboard-Password-Entry'>
                    <div className='Dashboard-Entry-Garbage-Container'>
                        <img src={'./garbage2.svg'} className="Dashboard-Entry-Garbage" alt="logo" onClick={() => deleteEntry(i)}/>
                    </div>
                    <div className='Dashboard-Password-Entry-Link'>
                      <p color='#fff'>Link: <input className='copy' title='Go to Website' value={aLink} spellcheck="false" onClick={() => redirect(aLink)}/></p>
                    </div>
                    <div className='Dashboard-Password-Entry-Email'>
                      <p color='#fff'>E-Mail: <input className='copy' title='Copy this entry' value={x.email} spellcheck="false" onClick={() => copyStringToClipboard(x.email)}/></p>
                    </div>
                    <div className='Dashboard-Password-Entry-Password'>
                      <p color='#fff'>Password: <input className='copy' title='Copy this entry' value={x.password} spellcheck="false"  onClick={() => copyStringToClipboard(x.password)}/></p>
                    </div>
                    <div className='free'>
                    </div>
                  </div>
         })}
        </div>
    </div>
  );
}

export default Dashboard;