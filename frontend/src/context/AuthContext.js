import { createContext, useState } from "react";

export const AuthContext = createContext(); //Generates a context that can be imported

export const AuthProvider = ({ children }) => { //Adopts the login logic of the programme when to display the dashboard and when to display the login page
  const [authState, setAuthState] = useState(undefined);
  const [userEmail, setUserEmail] = useState(undefined);
  const [userPassword, setUserPassword] = useState(undefined);
  
  
  const login = (token, email, password) => {
    setUserEmail(email);
    setUserPassword(password);
    setAuthState(token);
  };

  const logout = () => {
    setAuthState(undefined);
    setUserEmail(undefined);
    setUserPassword(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
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
