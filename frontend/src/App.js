import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Dashboard from './components/dashboard';
import Login from './components/login';

import './App.css';

function App() {
  const {authState} = useContext(AuthContext);

  return (
    <div className='App'>
      {!authState ? (
        <>
          <img src={'./private-cloud-closed.svg'} className="App-Logo-Login" alt="logo" />
          <Login/>
        </>
     ) : (
      <>
        <Dashboard/> 
        <img src={'./private-cloud-open.svg'} className="App-Logo-Dashboard" alt="logo" />
      </>
      )}
    </div>
  );
}

export default App;
