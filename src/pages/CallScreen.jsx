import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MdVideocam, MdVideocamOff, MdMic, MdMicOff, MdCallEnd, MdSend } from "react-icons/md";
import { useCall } from "../hooks/useCall";
import { useUsers } from "../hooks/useUsers";
import { playSound } from "../utils/SoundPlayer";
import VideoPlayer from "../components/VideoPlayer";

const CallScreen = () => {

  const call = useCall();
  const { userId } = useUsers();
  const { messages, sendMessage } = useCall();
  const [message, setMessage] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  const inCallRef = useRef(false);
  const firstMessage = useRef(true);

  const navigate = useNavigate();

  useEffect(() => {

    if (!call.inCall && !call.targetUserId) navigate("/");

  }, [call.inCall, call.targetUserId, navigate]);

  useEffect(() => {

    if (call.inCall && !inCallRef.current) {

      playSound("callStart");

    }
  
    if (!call.inCall && inCallRef.current) {

      playSound("callEnd");

    }
  
    inCallRef.current = call.inCall;

  }, [call.inCall]);

  useEffect(() => {

    if (call.messages.length === 0) return;
  
    const lastMessage = call.messages[0];
  
    if (firstMessage.current) {

      firstMessage.current = false;

      if (lastMessage.fromMe) return;

    }
  
    if (!lastMessage.fromMe) playSound("newMessage");

  }, [call.messages]);

  useEffect(() => {

    let interval;

    if (call.inCall) {

      setCallDuration(0);

      interval = setInterval(() => {

        setCallDuration((prev) => prev + 1);

      }, 1000);

    }

    return () => clearInterval(interval);

  }, [call.inCall]);

  const formatDuration = (seconds) => {

    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
  
    return `${h}:${m}:${s}`;

  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-800 text-white">
      {/* Main */}
      <div className="h-[calc(100vh-5.5rem)] flex pl-3 pt-3 pr-3">

        {/* Left */}
        <div className="flex-1 flex justify-center items-center bg-gray-900 rounded-xl relative">
          {/* Remote stream */}
          {
            call.inCall ? (
              call.remoteStream ? (
                <>
                  <VideoPlayer stream={call.remoteStream} className="w-full h-full scale-x-[-1]" />
                  {/* Remote id */}
                  {
                    call.targetUserId ? <h3 className="absolute top-3 left-3 font-bold text-sm py-1 px-3 rounded-md bg-black/50">{call.targetUserId}</h3> : null
                  }
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <p>Conexión establecida</p>
                  <p><span className="text-white">{call.targetUserId}</span> sin video disponible</p>
                </div>
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <p>Esperando conexión...</p>
              </div>
            )
          }
        </div>

        {/* Right */}
        <div className="w-1/3 flex flex-col pl-3">

          {/* Local stream */}
          <div className="h-[40%] flex items-center justify-center rounded-xl overflow-hidden relative">
            <VideoPlayer stream={call.localStream} className="w-full h-full object-cover scale-x-[-1]"/>
            {/* Local id */}
            {
              userId ? <h3 className="absolute top-3 right-3 font-bold text-sm py-1 px-3 rounded-md bg-black/50">{userId}</h3> : null
            }
            {
              !call.localStream && call.localStreamError ? <div className="absolute flex flex-col items-center justify-center inset-0 bg-gray-900">
              <span className="text-3xl font-bold">!</span>
              <span className="mt-2 text-sm">No se pudo acceder a la cámara</span>
            </div> : null
            }
          </div>

          {/* Chat */}
          <div className="h-[60%] flex flex-col mt-3 rounded-xl bg-gray-900 overflow-hidden">
            
            {/* Messages */}
            <div className="w-full flex-1 flex flex-col-reverse overflow-y-auto p-3">
              {
                messages.map((message, index) => (
                  <div key={index} className={`p-3 rounded-xl max-w-[70%] mb-3 ${message.fromMe ? "self-end bg-blue-600" : "self-start bg-gray-800"}`}>
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                ))
              }
            </div>

            {/* Send */}
            <div className="w-full flex items-center p-3 border-t border-gray-800">
              <input
                className="flex-1 min-w-0 bg-gray-800 px-3 py-2 rounded-xl outline-none"
                type="text"
                placeholder="Mensaje"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {

                  if (message.trim() === "") return;

                  if (e.key === "Enter") {

                    sendMessage(message);
                    setMessage("");

                  }

                }}
              />
              <button 
                className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center ml-3"
                onClick={() => {
                  
                  if (message.trim() === "") return;
                  
                  sendMessage(message);
                  setMessage("");

                }}
                >
                <MdSend className="w-5 h-5" />
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom nav */}
      <nav className="h-16 bg-gray-900 rounded-xl flex justify-between items-center m-3 p-3">
        <h3 className="">
          {call.inCall ? "Llamada en curso" : null}
        </h3>
        {
          call.inCall ? <span className=" text-gray-400">{formatDuration(callDuration)}</span> : null
        }
        <div className="flex space-x-3">
          <button
            onClick={call.toggleVideo}
            className={`w-11 h-11 rounded-full ${call.videoEnabled ? "bg-blue-500" : "bg-gray-800"} flex items-center justify-center relative`}>
            {
              call.videoEnabled ? (
                <MdVideocam className="w-5 h-5" />
              ) : (
                <MdVideocamOff className="w-5 h-5" />
              )
            }
          </button>
          <button onClick={call.toggleAudio} className={`w-11 h-11 rounded-full ${call.audioEnabled ? "bg-blue-500" : "bg-gray-800"} flex items-center justify-center`}>
            {
              call.audioEnabled ? (
                <MdMic className="w-5 h-5" />
              ) : (
                <MdMicOff className="w-5 h-5" />
              )
            }
          </button>
          <button onClick={call.hangUp} className="w-11 h-11 rounded-full bg-red-800 flex items-center justify-center">
            <MdCallEnd className="w-5 h-5" />
          </button>
        </div>
      </nav>

    </div>
  );

};

export default CallScreen;
