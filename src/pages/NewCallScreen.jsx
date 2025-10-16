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
    <div className="h-screen w-screen flex flex-col items-center justify-center background-primary">
      
      <audio ref={audioRef} src="/sounds/new-call.mp3" loop />

      <p className="animate-bounce text-subtitle mb-3">Llamada entrante</p>
      <p className="text-3xl truncate animate-pulse text-title mb-7">{call.targetUserId}</p>

      <div className="flex gap-3">
        <button onClick={handleReject} className="w-16 h-16 flex items-center justify-center transform transition-transform duration-300 hover:scale-120 animate-pulse rounded-full button-red">
          <MdCallEnd className="w-7 h-7"/>
        </button>
        <button onClick={handleAccept} className="w-16 h-16 flex items-center justify-center transform transition-transform duration-300 hover:scale-120 animate-pulse rounded-full button-primary">
          <MdCall className="w-7 h-7"/>
        </button>
      </div>

    </div>
  );
  
};

export default NewCallScreen;
