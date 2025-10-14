import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../context/UsersContext";
import { useCall } from "../context/CallContext";
import UserTile from "../components/UserTile";
import { MdPerson } from "react-icons/md";

const UsersScreen = () => {

  const { users, userId, updateUserId } = useUsers();
  const call = useCall();
  const navigate = useNavigate();

  useEffect(() => {

    if (call.targetUserId && call.targetOffer && !call.inCall) {

      navigate("/new-call");

    }

  }, [call.targetUserId, call.targetOffer, call.inCall, navigate]);

  return (
    
    <div className="h-screen w-screen bg-gray-800 text-white">

      <nav className="h-16 bg-gray-900 flex justify-between items-center px-3">
        <h3 className="font-bold">WebRTC</h3>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-transparent outline-none text-right"
            type="text"
            placeholder="Username"
            value={userId}
            onChange={(e) => updateUserId(e.target.value)}
            onFocus={(e) => e.target.select()} 
          />
          <MdPerson className="w-5 h-5" />
        </div>
      </nav>

      <main className="p-3 flex flex-col">
        {
          users.length === 0 ? (
            <div className="flex flex-col">
              <p className="text-lg font-medium">Sin usuarios conectados</p>
              <p className="text-sm mt-1 text-gray-400">Intenta de nuevo más tarde</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
              {
                users.map((user) => (
                  <UserTile
                    key={user.userId}
                    user={user}
                    onCall={async () => {

                      await call.startCall(user.userId);
                      
                      navigate("/call");

                    }}
                  />
                ))
              }
            </div>
          )
        }
      </main>


    </div>

  );
  
};

export default UsersScreen;
