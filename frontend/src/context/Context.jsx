import { createContext, useState } from "react";

export const AppContext = createContext({
  currentUser: {},
  setCurrentUser: () => {},
});

export default function AppContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({});

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}
