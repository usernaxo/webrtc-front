import { Routes, Route, Navigate } from "react-router-dom";
import UsersScreen from "../pages/UsersScreen";
import NewCallScreen from "../pages/NewCallScreen";
import CallScreen from "../pages/CallScreen";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<UsersScreen />} />
    <Route path="/new-call" element={<NewCallScreen />} />
    <Route path="/call" element={<CallScreen />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
