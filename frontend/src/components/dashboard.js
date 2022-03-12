import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const {logout} = useContext(AuthContext);

  return (
    <div className='Dashboard'>
      <h2>Dashboard</h2>

      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

export default Dashboard;
