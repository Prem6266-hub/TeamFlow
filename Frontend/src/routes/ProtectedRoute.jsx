import {Navigate} from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({children}){
    const {user} = useSelector((state) => state.auth);

    if(!user){
        return <Navigate to="/login" replace/>;
    }
    
    console.log("Protected user:", user);

    return children;
}

export default ProtectedRoute;