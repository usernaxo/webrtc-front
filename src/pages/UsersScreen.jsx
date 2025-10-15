import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { socketService } from "../services/SocketService";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef(null);
  const initializedRef = useRef(false); // ← Prevenir múltiples ejecuciones

  useEffect(() => {
    if (initializedRef.current) return; // ← Solo ejecutar UNA VEZ
    initializedRef.current = true;

    // Generar userId
    const random = Math.floor(Math.random() * 10000);
    const newUserId = `guest_${random}`;
    setInputValue(newUserId);
    setUserId(newUserId);

    const handleConnect = () => {
      console.log("✅ Socket conectado, registrando usuario");
      socketService.emit("register", { userId: newUserId, fcmToken: "" });
    };

    const handleUsers = (data) => {
      setUsers(
        data.filter(u => u.userId && u.userId !== newUserId).map(u => ({
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

    // Si ya está conectado, registrar inmediatamente
    if (socketService.socket?.connected) {
      handleConnect();
    }

    socketService.on("connect", handleConnect);
    socketService.on("users", handleUsers);

    return () => {
      socketService.off("connect", handleConnect);
      socketService.off("users", handleUsers);
    };
  }, []); // ← Array vacío, NO depender de userId

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