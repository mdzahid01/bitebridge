import axiosClient from "./axiosClient";
import type { iLoginForm } from "../types/auth.types";

const authApi = {
    signup: async(formData:FormData)=>{
        const response = await axiosClient.post("/auth/signup",formData)
        return response;
    },
    
    login: async(formData:iLoginForm)=>{
        const response = await axiosClient.post("/auth/login",formData)
        return response;
    },
    
    getProfile: async ()=>{
        const response = await axiosClient.get('/auth/me')
        return response;
    }
}

export default authApi