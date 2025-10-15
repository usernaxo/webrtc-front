import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { socketService } from "../services/SocketService";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {

  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {

    if (!socketService.socket) socketService.init();

    socketService.onConnect(() => {
  
      const random = Math.floor(Math.random() * 10000);

      const userId = `guest_${random}`;

      setInputValue(userId);

      setUserId(userId);

      socketService.emit("register", { userId, fcmToken: "" });

    });

    const handleUsers = (data) => {
      setUsers(
        data.filter(u => u.userId && u.userId !== userId).map(u => ({
          userId: u.userId,
          fcmToken: u.fcmToken,
          agent: u.agent,
          ip: u.ip,
          city: u.city,
          country: u.country,
          isp: u.isp
        }))
      );
    };
    
    socketService.on("users", handleUsers);

    return () => {
      socketService.socket?.off("connect");
      socketService.socket?.off("users", handleUsers);
    };

  }, [userId]);

  const updateUserId = (newVal) => {

    setInputValue(newVal);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {

      const clean = newVal.trim();

      if (!clean || clean === userId) return;

      setUserId(clean);

      socketService.emit("register", { userId: clean, fcmToken: "" });

    }, 800);
    
  };

  return (
    <UsersContext.Provider value={{ users, userId: inputValue, updateUserId }}>
      {children}
    </UsersContext.Provider>
  );

};

export const useUsers = () => useContext(UsersContext);
