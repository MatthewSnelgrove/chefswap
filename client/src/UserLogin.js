import { createContext, useState } from "react";

const UserLogin = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserLogin.Provider value={{ user, setUser }}>
      {children}
    </UserLogin.Provider>
  );
}

export default UserLogin;
