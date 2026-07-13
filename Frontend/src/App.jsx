import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { setCredentials } from './features/auth/authSlice';
import { login } from './features/auth/authSlice';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

function App() {
  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            <Route path="/login" element={<PublicRoute><Login/></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register></Register></PublicRoute>}/>
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App;
