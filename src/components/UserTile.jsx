import React from "react";
import { MdCall } from "react-icons/md";

const UserTile = ({ user, onCall }) => {

  return (
    <div className="rounded-xl transition flex flex-col space-y-2 p-3 background-secondary">

      {/* username and agent */}
      <div className="flex justify-between items-center">

        <div className="max-w-[70%] truncate text-subtitle text-primary">
          {user.userId}
        </div>

        <div className="flex items-center space-x-1 text-description">
          <span>{user.agent}</span>
        </div>

      </div>

      {/* info */}
      <div className="flex justify-between items-center">

        {/* user data */}
        <div className="flex-1 truncate space-y-0.5 text-description">
          <div className="truncate">{user.city}, {user.country}</div>
          <div className="truncate">{user.ip}</div>
          <div className="truncate">{user.isp}</div>
        </div>

        {/* call button */}
        <button onClick={onCall} className="w-10 h-10 flex items-center justify-center transition rounded-full ml-3 button-secondary">
          <MdCall className="w-5 h-5" />
        </button>

      </div>

    </div>
  );
};

export default UserTile;
