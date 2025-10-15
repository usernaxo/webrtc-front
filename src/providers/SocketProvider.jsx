import { useState, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import { socketService } from "../services/SocketService";

export const SocketProvider = ({ children }) => {
    
  const [socket, setSocket] = useState(null);

  useEffect(() => {

    socketService.init();

    setSocket(socketService.socket);

    return () => {

      socketService.dispose();

      setSocket(null);

    }

  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );

}
