import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (authData) => {
    const decodedToken = jwtDecode(authData.accessToken);

    const octopiUser = {
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      id: decodedToken.id,
      role: decodedToken.role,
    };

    localStorage.setItem("octopiUser", JSON.stringify(octopiUser));

    setUser(octopiUser);
  };

  const logout = () => {
    localStorage.removeItem("octopiUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}