import api from "./api";

export const registerUser = async(userData) => {
    const response = await api.post(
        "/api/auth/register",
        userData
    );

    return response.data;
}

export const loginUser = async(userData) =>{
    const response = await api.post("/api/auth/login", userData);
    return response.data;
};

const logoutUser = async (req,res) => {
    const response = await api.post("/api/auth/logout");
    return response.data;
};