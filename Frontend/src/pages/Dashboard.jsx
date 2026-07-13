import React from 'react'
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

function Dashboard() {

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  }


  return (
    <>
      <div>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  )
}

export default Dashboard;