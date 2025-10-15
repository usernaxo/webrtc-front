import React from "react";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./providers/SocketProvider"
import { UsersProvider } from "./providers/UsersProvider";
import { CallProvider } from "./providers/CallProvider";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <SocketProvider>
      <UsersProvider>
        <CallProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CallProvider>
      </UsersProvider>
    </SocketProvider>
  );
};

export default App;
