import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MdVideocam, MdVideocamOff, MdMic, MdMicOff, MdCallEnd, MdSend, MdSettings, MdChat, MdCheck } from "react-icons/md";
import { useCall } from "../hooks/useCall";
import { playSound } from "../utils/SoundPlayer";
import VideoPlayer from "../components/VideoPlayer";

const CallScreen = () => {

  const call = useCall();
  const { messages, sendMessage } = useCall();
  const [message, setMessage] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  const inCallRef = useRef(false);
  const firstMessage = useRef(true);

  const [showDevices, setShowDevices] = useState(false);
  const [devices, setDevices] = useState({ cameras: [], mics: [] });
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");

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

  const loadDevices = async () => {

    const devices = await navigator.mediaDevices.enumerateDevices();

    setDevices({
      cameras: devices.filter((d) => d.kind === "videoinput"),
      mics: devices.filter((d) => d.kind === "audioinput")
    });

    const videoTrack = call.localStream?.getVideoTracks()[0];
    const audioTrack = call.localStream?.getAudioTracks()[0];
  
    setSelectedCamera(videoTrack?.getSettings()?.deviceId || "");
    setSelectedMic(audioTrack?.getSettings()?.deviceId || "");

  };

  return (
    <div className="h-screen w-screen flex flex-col p-3 background-primary">

      {/* main */}
      <div className="h-[calc(100vh-6.25rem)] flex flex-col md:flex-row">

        {/* left */}
        <div className="h-[calc((100vh-5rem)/2)] md:h-full md:flex-1 flex justify-center items-center rounded-xl relative background-tertiary">

          {/* remote stream */}
          {
            call.inCall ? (
              call.remoteStream ? (
                <>
                  <VideoPlayer stream={call.remoteStream} className="w-full h-[calc((100vh-5rem)/2)] md:h-full scale-x-[-1] relative" />

                  {/* remote id */}
                  {
                    call.targetUserId ? <h3 className="absolute top-3 left-3 py-1 px-3 rounded-full bg-black/50 text-subtitle">{call.targetUserId}</h3> : null
                  }

                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <p className="text-subtitle">Conexión establecida</p>
                  <p className="text-hint"><span className="text-primary">{call.targetUserId}</span> sin video disponible</p>
                </div>
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-subtitle">
                <p>Esperando conexión...</p>
              </div>
            )
          }
          <div className="w-32 h-24 items-center justify-center rounded-xl overflow-hidden bottom-3 right-3 absolute flex md:hidden">

            <VideoPlayer stream={call.localStream} className="w-full h-full object-cover scale-x-[-1] opacity-75"/>
            {
              !call.localStream && call.localStreamError ? <div className="absolute flex flex-col items-center justify-center inset-0 background-primary">
                <span className="text-3xl text-title">!</span>
              </div> : null
            }
          </div>

        </div>

        {/* right */}
        <div className="w-full md:w-1/3 flex flex-col md:pl-3">

          {/* local stream */}
          <div className="h-[40%] hidden md:flex items-center justify-center rounded-xl overflow-hidden relative">

            <VideoPlayer stream={call.localStream} className="w-full h-full object-cover scale-x-[-1]"/>
            {
              !call.localStream && call.localStreamError && (
                <div className="absolute flex flex-col items-center justify-center inset-0 background-tertiary">
                  <span className="text-3xl text-title">!</span>
                  <span className="text-hint mt-1">No se pudo acceder a la cámara</span>
                </div>
              )
            }

          </div>

          {/* chat and devices */}
          <div className="h-[calc((100vh-9rem)/2)] md:h-[60%] flex flex-col rounded-xl overflow-hidden background-tertiary mt-3">

            {
              showDevices ? (
                <>
                  {/* devices */}
                  <div className="flex-1 overflow-y-auto border-b border-primary scrollbar">

                    <h4 className="text-hint p-3">Dispositivos de video</h4>

                    {
                      devices.cameras.length === 0 ? (
                        <p className="flex justify-between items-center text-description pl-3 pr-3 pb-3">Sin dispositivos disponibles</p>
                      ) : (
                        <ul>
                          {
                            devices.cameras.map((cam) => (
                              <li
                                key={cam.deviceId}
                                className={`flex justify-between items-center cursor-pointer text-description ${selectedCamera === cam.deviceId ? "background-primary" : ""} p-3`}
                                onClick={async () => {
                                  setSelectedCamera(cam.deviceId);
                                  await call.changeDevice({ cameraId: cam.deviceId });
                                }}
                              >
                                <span className="truncate pr-3">{cam.label || `Cámara ${cam.deviceId}`}</span>
                                {selectedCamera === cam.deviceId && <MdCheck className="w-3 h-3"/>}
                              </li>
                            ))
                          }
                        </ul>
                      )
                    }

                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar">

                    <h4 className="text-hint p-3">Dispositivos de audio</h4>

                    {
                      devices.mics.length === 0 ? (
                        <p className="flex justify-between items-center text-description pl-3 pr-3 pb-3">Sin dispositivos disponibles</p>
                      ) : (
                        <ul>
                          {
                            devices.mics.map((mic) => (
                              <li
                                key={mic.deviceId}
                                className={`flex justify-between items-center cursor-pointer text-description ${selectedMic === mic.deviceId ? "background-primary" : ""} p-3`}
                                onClick={async () => {
                                  setSelectedMic(mic.deviceId);
                                  await call.changeDevice({ micId: mic.deviceId });
                                }}
                              >
                                <span className="truncate pr-3" >{mic.label || `Micrófono ${mic.deviceId}`}</span>
                                {selectedMic === mic.deviceId && <MdCheck className="w-3 h-3"/>}
                              </li>
                            ))
                          }
                        </ul>
                      )
                    }

                  </div>

                </>
              ) : (
                <>
                  {/* Chat */}
                  <div className="w-full flex-1 flex flex-col-reverse overflow-y-auto scrollbar p-3">
                    {
                      messages.map((message, index) => (
                        <div key={index} className={`max-w-[70%] rounded-xl ${message.fromMe ? "self-end button-primary" : "self-start background-primary"} mb-2 px-3 py-2`}>
                          <p className="break-words text-description">{message.text}</p>
                        </div>
                      ))
                    }
                  </div>

                  <div className="w-full flex items-center border-t border-primary p-3">
                    <input
                      className="flex-1 min-w-0 rounded-xl outline-none background-primary text-description px-3 py-2"
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
                      className="w-11 h-11 rounded-full flex items-center justify-center button-primary ml-3"
                      onClick={() => {
                        if (message.trim() === "") return;
                        sendMessage(message);
                        setMessage("");
                      }}
                    >
                      <MdSend className="w-5 h-5" />
                    </button>
                  </div>

                </>
              )
            }

          </div>

        </div>

      </div>

      {/* bottom nav */}
      <nav className="h-16 flex justify-between items-center rounded-xl background-tertiary mt-3 p-3">

        <h3 className="flex-1 text-subtitle" >
          {call.inCall ? "En llamada" : null}
        </h3>

        {
          call.inCall ? <span className="flex-1 flex justify-center text-subtitle">{formatDuration(callDuration)}</span> : null
        }

        <div className="flex-1 flex justify-end space-x-2">
          <button
            onClick={async () => {
              if (!showDevices) await loadDevices();
              setShowDevices((prev) => !prev);
            }}
            className="w-11 h-11 flex items-center justify-center rounded-full button-secondary"
          >
            {showDevices ? <MdChat className="w-5 h-5" /> : <MdSettings className="w-5 h-5" />}
          </button>
          <button
            onClick={call.toggleVideo}
            className={`w-11 h-11 flex items-center justify-center rounded-full button-secondary`}
          >
            {
              call.videoEnabled ? (
                <MdVideocam className="w-5 h-5" />
              ) : (
                <MdVideocamOff className="w-5 h-5 text-error" />
              )
            }
          </button>
          <button
            onClick={call.toggleAudio}
            className={`w-11 h-11 flex items-center justify-center rounded-full button-secondary`}
          >
            {
              call.audioEnabled ? (
                <MdMic className="w-5 h-5" />
              ) : (
                <MdMicOff className="w-5 h-5 text-error" />
              )
            }
          </button>
          <button onClick={call.hangUp} className="w-11 h-11 rounded-full flex items-center justify-center button-red">
            <MdCallEnd className="w-5 h-5" />
          </button>
        </div>

      </nav>

    </div>
  );

};

export default CallScreen;
