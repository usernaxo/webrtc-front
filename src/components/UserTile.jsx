import React from "react";
import { MdCall, MdLanguage, MdPhoneAndroid, MdPhoneIphone } from "react-icons/md";

const UserTile = ({ user, onCall }) => {

  const getAgentIcon = (agent) => {
    switch (agent.toLowerCase()) {
      case "firefox":
      case "chrome":
      case "safari":
      case "unknown":
        return <MdLanguage className="w-5 h-5" />;
      case "android":
        return <MdPhoneAndroid className="w-5 h-5" />;
      case "ios":
        return <MdPhoneIphone className="w-5 h-5" />;
      default:
        return <MdLanguage className="w-5 h-5" />;
    }
  };

  return (
    <div className="rounded-xl shadow-md transition flex flex-col space-y-2 p-3 bg-gray-700 hover:bg-gray-600">

      {/* userId y agent */}
      <div className="flex justify-between items-center">

        <div className="text-white font-semibold truncate max-w-[70%]">
          {user.userId}
        </div>

        <div className="flex items-center text-teal-300 space-x-1">
          <span className="text-sm">{user.agent}</span>
          {
            getAgentIcon(user.agent)
          }
        </div>

      </div>

      {/* info */}
      <div className="flex justify-between items-center">

        {/* user data */}
        <div className="flex-1 truncate text-sm space-y-1 text-gray-300">
          <div className="truncate">{user.city}, {user.country}</div>
          <div className="truncate">{user.ip}</div>
          <div className="truncate">{user.isp}</div>
        </div>

        {/* call button */}
        <button onClick={onCall} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-900 flex items-center justify-center transition ml-3">
          <MdCall className="w-5 h-5" />
        </button>

      </div>

    </div>
  );
};

export default UserTile;
