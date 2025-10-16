import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCall } from "../hooks/useCall";
import { useUsers } from "../hooks/useUsers";
import UserTile from "../components/UserTile";

const UsersScreen = () => {

  const call = useCall();
  const { users, userId, updateUserId } = useUsers();
  
  const navigate = useNavigate();

  useEffect(() => {

    if (call.targetUserId && call.targetOffer && !call.inCall) navigate("/new-call");

  }, [call.targetUserId, call.targetOffer, call.inCall, navigate]);

  return (
    
    <div className="h-screen w-screen background-primary">

      <nav className="h-16 flex justify-between items-center px-3 border-b border-primary">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-5 h-5 text-primary">
            <circle cx="300" cy="70" r="50" fill="currentColor"></circle>
            <circle cx="100" cy="330" r="50" fill="currentColor"></circle>
            <path d="M 300 70 L 270 200 L 200 200 L 130 200 L 100 330" stroke="currentColor" stroke-width="28" fill="none"></path>
          </svg>
          <h3 className="text-title">WebRTC</h3>
        </div>
        <div className="flex items-center gap-1">
          <input
            className="flex-1 outline-none text-right text-subtitle"
            type="text"
            placeholder="Username"
            value={userId}
            onChange={(e) => updateUserId(e.target.value)}
            onFocus={(e) => e.target.select()} 
          />
        </div>
      </nav>

      <main className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar p-3">
        {
          users.length === 0 ? (
            <div className="flex flex-col">
              <p className="text-subtitle">Sin usuarios conectados</p>
              <p className="text-sm mt-1 text-hint">Intenta de nuevo más tarde</p>
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
