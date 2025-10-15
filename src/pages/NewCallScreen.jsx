import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MdCall, MdCallEnd } from "react-icons/md";
import { useCall } from "../hooks/useCall";

const NewCallScreen = () => {

  const call = useCall();

  const audioRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {

    if (!call.inCall && !call.targetUserId) navigate("/");

  }, [call.inCall, call.targetUserId, navigate]);

  useEffect(() => {

    const audio = audioRef.current;

    if (audio) audio.play().catch((e) => console.warn(e));

    return () => {

      if (audio) {

        audio.pause();
        audio.currentTime = 0;

      }

    };

  }, []);

  const handleAccept = async () => {

    audioRef.current.pause();

    await call.answerCall();

    navigate("/call", { replace: true });

  };

  const handleReject = async () => {

    audioRef.current.pause();
    
    await call.rejectCall();

    navigate("/", { replace: true });

  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-md">
      
      <audio ref={audioRef} src="/sounds/new-call.mp3" loop />

      <p className="mb-4 font-bold animate-bounce text-white">Llamada entrante</p>
      <p className="mb-6 text-3xl truncate font-bold animate-pulse text-gray-300">{call.targetUserId}</p>

      <div className="flex gap-3">
        <button
          onClick={handleReject}
          className="w-16 h-16 rounded-full bg-red-800 flex items-center justify-center transform transition-transform duration-300 hover:scale-120 animate-pulse"
        >
          <MdCallEnd className="w-7 h-7"/>
        </button>
        <button
          onClick={handleAccept}
          className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center transform transition-transform duration-300 hover:scale-120 animate-pulse"
        >
          <MdCall className="w-7 h-7"/>
        </button>
      </div>

    </div>
  );
  
};

export default NewCallScreen;
