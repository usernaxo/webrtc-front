import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { socketService } from "../services/SocketService";
import { webRTCService } from "../services/WebRTCService";

const CallContext = createContext();

export const CallProvider = ({ children }) => {

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [targetUserId, setTargetUserId] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [localStreamError, setLocalStreamError] = useState(false);
  const [messages, setMessages] = useState([]);

  const targetUserIdRef = useRef(null);

  useEffect(() => {
    
    targetUserIdRef.current = targetUserId;

  }, [targetUserId]);

  useEffect(() => {

    webRTCService.onIceCandidate = (candidate) => {

      const currentTargetId = targetUserIdRef.current;
      
      if (!currentTargetId) return;

      socketService.emit("ice-candidate", { 
        targetUserId: currentTargetId, 
        candidate 
      });

    };

    webRTCService.onTrack = (remote) => {

      setRemoteStream(remote);

    };

    webRTCService.onDataChannelMessage = (message) => {

      setMessages(prev => [{ text: message, fromMe: false }, ...prev]);

    };

    const handleIceCandidate = async (data) => {
      
      try {

        console.log(`CANDIDATE RECIBIDO: ${data}`);

        await webRTCService.addCandidate(data.candidate);

      } catch (e) {

        console.error(e);

      }

    };

    const handleReceivingCall = (data) => {

      setTargetUserId(data.callerUserId);
      setCurrentOffer(data.offer);

      console.log(`OFERTA RECIBIDA: ${data}`);

    };

    const handleCallAnswered = async (data) => {
      
      try {

        console.log(`ANSWER RECIBIDA: ${data}`);

        await webRTCService.setRemoteDescription(data.answer);
        
        setAudioEnabled(true);
        setVideoEnabled(true);
        setInCall(true);

      } catch (e) {

        console.error(e);

      }

    };

    const handleCallEnded = async () => {
      
      await webRTCService.close();
      
      setTargetUserId(null);
      setCurrentOffer(null);
      setAudioEnabled(false);
      setVideoEnabled(false);
      setInCall(false);
      setLocalStream(null);
      setRemoteStream(null);
      setMessages([]);

    };

    socketService.on("ice-candidate", handleIceCandidate);
    socketService.on("receiving-call", handleReceivingCall);
    socketService.on("call-answered", handleCallAnswered);
    socketService.on("call-ended", handleCallEnded);

    return () => {
      socketService.off("ice-candidate", handleIceCandidate);
      socketService.off("receiving-call", handleReceivingCall);
      socketService.off("call-answered", handleCallAnswered);
      socketService.off("call-ended", handleCallEnded);
    };

  }, []);

  const startCall = async (targetId) => {

    try {
      
      setTargetUserId(targetId);
      
      const stream = await webRTCService.initLocalStream();
      
      setLocalStream(stream);
      setLocalStreamError(!stream && webRTCService.hasLocalStreamError());

      await webRTCService.createPeer();

      const offer = await webRTCService.createOffer();

      socketService.emit("call", {
        targetUserId: targetId,
        offer: offer
      });
      
    } catch (e) {

      console.error(e);

      setTargetUserId(null);
      setLocalStreamError(true);

    }

  };

  const answerCall = async () => {

    if (!targetUserId || !currentOffer) return;

    try {
      
      const stream = await webRTCService.initLocalStream();

      setLocalStream(stream);
      setLocalStreamError(!stream && webRTCService.hasLocalStreamError());

      await webRTCService.createPeer();
      await webRTCService.setRemoteDescription(currentOffer);

      const answer = await webRTCService.createAnswer();

      socketService.emit("answer-call", {
        targetUserId,
        answer: answer
      });

      setAudioEnabled(true);
      setVideoEnabled(true);
      setInCall(true);
      setCurrentOffer(null);
      
    } catch (e) {

      console.error(e);
      setLocalStreamError(true);

    }

  };

  const rejectCall = async () => {

    if (!targetUserId) return;
    
    socketService.emit("end-call", { targetUserId });

    setTargetUserId(null);
    setCurrentOffer(null);
    setAudioEnabled(false);
    setVideoEnabled(false);
    setInCall(false);
    setMessages([]);

  };

  const toggleAudio = () => {

    const newState = !audioEnabled;

    setAudioEnabled(newState);

    webRTCService.toggleAudio(newState);

  };

  const toggleVideo = () => {

    const newState = !videoEnabled;

    setVideoEnabled(newState);

    webRTCService.toggleVideo(newState);

  };

  const sendMessage = (message) => {

    webRTCService.sendMessage(message);

    setMessages(prev => [{ text: message, fromMe: true }, ...prev]);

  };

  const hangUp = async () => {
    
    await webRTCService.close();

    if (targetUserId) {

      socketService.emit("end-call", { targetUserId });

    }

    setTargetUserId(null);
    setCurrentOffer(null);
    setAudioEnabled(false);
    setVideoEnabled(false);
    setInCall(false);
    setLocalStream(null);
    setRemoteStream(null);
    setMessages([]);
    
  };

  return (
    <CallContext.Provider
      value={{
        targetUserId,
        targetOffer: currentOffer,
        audioEnabled,
        videoEnabled,
        inCall,
        localStream,
        remoteStream,
        localStreamError,
        startCall,
        answerCall,
        rejectCall,
        sendMessage,
        toggleAudio,
        toggleVideo,
        hangUp,
        messages
      }}
    >
      {children}
    </CallContext.Provider>
  );

};

export const useCall = () => useContext(CallContext);
