import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';

function Dashboard() {
  const {logout} = useContext(AuthContext);

  return (
    <div className='Dashboard'>
        <div className='Dashboard-TopLane'>
            <div className='Dashboard-Topic-Container'>
                <h2 className='Dashboard-Topic'>Dashboard</h2>
            </div>
            <div className="Dashboard-Settings-Container">
              <img src={'./settings.svg'} className="Dashboard-Settings" alt="logo" onClick={() => logout()}/>
            </div>
            <img src={'./logout-black.svg'} className="Dashboard-Logout" alt="logo" onClick={() => logout()}/>  
        </div>



        <div className='Dashboard-Password'>
          <div className='Dashboard-Password-Entry'>
            <div className='Dashboard-Entry-Garbage-Container'>
                <img src={'./garbage2.svg'} className="Dashboard-Entry-Garbage" alt="logo"/>
            </div>
            <div className='Dashboard-Password-Entry-Link'>
              <p color='#fff'>Link: <a href='https://www.google.de'>www.google.de</a></p>
            </div>
            <div className='Dashboard-Password-Entry-Email'>
              <p color='#fff'>E-Mail: <a>lukas-ernst@outlook.com</a></p>
            </div>
            <div className='Dashboard-Password-Entry-Password'>
              <p color='#fff'>Password: <a>uvzkzvrcx4576</a></p>
            </div>
            <div className='Dashboard-Entry-Copy-Container'>
                <img src={'./copy.svg'} className="Dashboard-Password-Entry-Copy" alt="logo"/>
            </div>
          </div>
          <div className='Dashboard-Password-Entry'>
            <div className='Dashboard-Entry-Garbage-Container'>
                <img src={'./garbage2.svg'} className="Dashboard-Entry-Garbage" alt="logo"/>
            </div>
            <div className='Dashboard-Password-Entry-Link'>
              <p color='#fff'>Link: <a href='https://www.google.de'>www.google.de</a></p>
            </div>
            <div className='Dashboard-Password-Entry-Email'>
              <p color='#fff'>E-Mail: <a>lukas-ernst@outlook.com</a></p>
            </div>
            <div className='Dashboard-Password-Entry-Password'>
              <p color='#fff'>Password: <a>uvzkzvrcx4576</a></p>
            </div>
            <div className='Dashboard-Entry-Copy-Container'>
                <img src={'./copy.svg'} className="Dashboard-Password-Entry-Copy" alt="logo"/>
            </div>
          </div>
          <div className='Dashboard-Password-Entry'>
            <div className='Dashboard-Entry-Garbage-Container'>
                <img src={'./garbage2.svg'} className="Dashboard-Entry-Garbage" alt="logo"/>
            </div>
            <div className='Dashboard-Password-Entry-Link'>
              <p color='#fff'>Link: <a href='https://www.google.de'>www.google.de</a></p>
            </div>
            <div className='Dashboard-Password-Entry-Email'>
              <p color='#fff'>E-Mail: <a>lukas-ernst@outlook.com</a></p>
            </div>
            <div className='Dashboard-Password-Entry-Password'>
              <p color='#fff'>Password: <a>uvzkzvrcx4576</a></p>
            </div>
            <div className='Dashboard-Entry-Copy-Container'>
                <img src={'./copy.svg'} className="Dashboard-Password-Entry-Copy" alt="logo"/>
            </div>
          </div>
        </div>
    </div>
  );
}

export default Dashboard;
