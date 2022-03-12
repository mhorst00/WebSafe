import { createContext, useState } from "react";

export const AuthContext = createContext();
export const AuthProvider = ({children}) => {
    const [authState, setAuthState] = useState(undefined);

    const login = () => {
        setAuthState('jwt-token')
    }

    const logout = () => {
        setAuthState(undefined);
    }

    return <AuthContext.Provider value={{authState, login, logout}}>{children}</AuthContext.Provider>;
} 
