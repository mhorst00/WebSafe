import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(undefined);
  const [email, setEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);

  const [userEmail, setUserEmail] = useState(undefined);
  const [userPassword, setUserPassword] = useState(undefined);

  const login = (token, email, password) => {
    setAuthState(token);
    setEmail(email);
    setUserEmail(email);
    setPassword(password);
    setUserPassword(password);
  };

  const logout = () => {
    setAuthState(undefined);
    setEmail(undefined);
    setPassword(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        email,
        password,
        userEmail,
        userPassword,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
