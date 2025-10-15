import { useContext } from "react";
import { CallContext } from "../context/CallContext";

export const useCall = () => useContext(CallContext);
