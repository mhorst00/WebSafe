import Login from './components/login'
import './App.css';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Dashboard from './components/dashboard';

function App() {
  const {authState} = useContext(AuthContext);

  return (
    <div className='App'>
      {!authState ? <Login/> : <Dashboard/>}
     
    </div>
  );
}

export default App;
