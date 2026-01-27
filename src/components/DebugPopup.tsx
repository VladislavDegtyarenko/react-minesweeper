"use client";

import { useDebug } from "@/contexts/DebugContext";
import { useEffect } from "react";

const DebugPopup = () => {
  const { messages } = useDebug();

  useEffect(() => {
    if (messages) {
      const ul = document.querySelector(".debug-popup ul");
      if (ul) {
        ul.scrollTop = ul.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="debug-popup">
      {/* <h2>Debug Popup</h2> */}
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default DebugPopup;
