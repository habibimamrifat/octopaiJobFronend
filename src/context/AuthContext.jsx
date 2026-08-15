import { useState } from "react";
import { AuthContext } from "./auth-context";
import { MENU } from "../const/menu";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];

    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function getStoredUser() {
  const storedUser = localStorage.getItem("octopiUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("octopiUser");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const [selectedMenu, setSelectedMenu] = useState(() => {
    const storedUser = getStoredUser();

    if (!storedUser?.role) {
      return null;
    }

    return MENU[storedUser.role]?.[0] || null;
  });

  const login = (authData) => {
    const payload = decodeToken(authData.accessToken);

    const octopiUser = {
      id: payload?.id || null,
      role: payload?.role || null,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
    };

    localStorage.setItem("octopiUser", JSON.stringify(octopiUser));

    localStorage.setItem("accessToken", authData.accessToken);

    localStorage.setItem("refreshToken", authData.refreshToken);

    setUser(octopiUser);

    // First menu is selected by default
    const firstMenu = MENU[octopiUser.role]?.[0] || null;
    setSelectedMenu(firstMenu);

    return octopiUser;
  };

  const selectMenu = (menu) => {
    setSelectedMenu(menu);
  };

  const logout = () => {
    localStorage.removeItem("octopiUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setUser(null);
    setSelectedMenu(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        selectedMenu,
        selectMenu,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
