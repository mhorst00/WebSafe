import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(undefined);
    const [email, setEmail] = useState(undefined);
    const [password, setPassword] = useState(undefined);

    const login = (token, email, password) => {
        setAuthState('jwt-token ' + token);
        setEmail('email ' + email);
        setPassword('password ' + password);
    }

    const logout = () => {
        setAuthState(undefined);
        setEmail(undefined);
        setPassword(undefined);
    }

    return <AuthContext.Provider value={{ authState, login, logout }}>{children}</AuthContext.Provider>;
} 
