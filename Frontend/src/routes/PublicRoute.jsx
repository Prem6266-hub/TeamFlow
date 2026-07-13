import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PublicRoute({children}){
    const {user} = useSelector((state) => state.auth);

    if(user){
        return <Navigate to="/dashboard" replace/>;
    }

    console.log("Public user:", user);

    return children;
}

export default PublicRoute;