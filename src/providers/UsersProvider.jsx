import { useState, useEffect, useRef } from "react";
import { UsersContext } from "../context/UsersContext";
import { useSocket } from "../hooks/useSocket";

export const UsersProvider = ({ children }) => {

  const socket = useSocket();

  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [inputValue, setInputValue] = useState("");

  const userIdRef = useRef(userId);
  const debounceRef = useRef(null);

  useEffect(() => { userIdRef.current = userId }, [userId]);

  useEffect(() => {

    if (!socket) return;
    
    const handleConnect = () => {
  
      const random = Math.floor(Math.random() * 10000);

      const userId = `guest_${random}`;

      setInputValue(userId);

      setUserId(userId);

      socket.emit("register", { userId, fcmToken: "" });

    };

    const handleUsers = (data) => {

      setUsers(
        data.filter(u => u.userId && u.userId !== userIdRef.current).map(u => ({
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
    
    socket.on("connect", handleConnect);
    socket.on("users", handleUsers);

    return () => {

      socket.off("connect", handleConnect);
      socket.off("users", handleUsers);
      
    };

  }, [socket]);

  const updateUserId = (newVal) => {

    setInputValue(newVal);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {

      const clean = newVal.trim();

      if (!clean || clean === userId) return;

      setUserId(clean);

      socket?.emit("register", { userId: clean, fcmToken: "" });

    }, 800);
    
  };

  return (
    <UsersContext.Provider value={{ users, userId: inputValue, updateUserId }}>
      {children}
    </UsersContext.Provider>
  );

};
