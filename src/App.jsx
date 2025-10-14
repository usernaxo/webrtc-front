import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UsersProvider } from "./context/UsersContext";
import { CallProvider } from "./context/CallContext";

import UsersScreen from "./pages/UsersScreen";
import NewCallScreen from "./pages/NewCallScreen";
import CallScreen from "./pages/CallScreen";

const App = () => {
  return (
    <UsersProvider>
      <CallProvider>
        <Router>
          <Routes>
            <Route path="/users" element={<UsersScreen />} />
            <Route path="/new-call" element={<NewCallScreen />} />
            <Route path="/call" element={<CallScreen />} />
            {/* Redirigir cualquier ruta desconocida */}
            <Route path="*" element={<Navigate to="/users" replace />} />
          </Routes>
        </Router>
      </CallProvider>
    </UsersProvider>
  );
};

export default App;
