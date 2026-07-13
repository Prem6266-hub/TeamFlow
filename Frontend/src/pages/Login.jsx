import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {login} from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function Login() {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const {user} = useSelector((state) => state.auth);

    const navigate = useNavigate();
    useEffect(() => {
        if(user){
            navigate("/dashboard");
        }
    },[user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(login(formData));
    }

    
    return (
        <>
          <h1>Login</h1>

          <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />

            <button type="submit">Login</button>
          </form>
        </>
    )


}

export default Login;