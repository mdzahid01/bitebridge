import { createContext,useContext, useState, type ReactNode } from "react";
import {type IUser } from "../types/user.types";

interface AuthContextType{
    authUser : IUser | null,
    setAuthUser: (user:IUser | null ) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({children}:{children: ReactNode})=>{
    const [authUser, setAuthUser] = useState<IUser| null>(null);

    return (
    <AuthContext.Provider value = {{authUser, setAuthUser}}>
        {children}
    </AuthContext.Provider>
    )
}

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error("UseAuth Must be used within An AuthProvider")
    }
    return context;
}


export default AuthProvider

