"use client";

import { createContext, useContext, useState } from "react";

type DebugContextType = {
  messages: string[];
  addMessage: (message: string) => void;
};

const DebugContext = createContext<DebugContextType>({
  messages: [],
  addMessage: () => {},
});

export const DebugProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState([] as string[]);

  const addMessage = (message: string) => {
    setMessages([...messages, message]);
  };

  return (
    <DebugContext.Provider value={{ messages, addMessage }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  return useContext(DebugContext);
};
