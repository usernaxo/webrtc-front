class WebRTCService {

  constructor() {

    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.dataChannel = null;

    this.onIceCandidate = null;
    this.onTrack = null;
    this.onDataChannelMessage = null;

    this.pendingCandidates = [];
    this.remoteDescriptionSet = false;

    this.localStreamError = null;

  }

  async initLocalStream() {

    if (!this.localStream) {

      const constraints = {
        audio: true,
        video: {
          facingMode: 'user'
        }
      };

      try {

        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      } catch (e) {

        console.error(e);

        this.localStreamError = e;

      }

    }

    return this.localStream;
  }

  async createPeer() {

    try {

      const configuration = {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302"
          },
          {
            urls: [
              "turn:turn.usernaxo.com:3478",
              "turns:turn.usernaxo.com:5349"
            ],
            username: "turn",
            credential: "S3cur3P@ssw0rd!"
          }
        ]
      };

      this.peerConnection = new RTCPeerConnection(configuration);

      this.dataChannel = this.peerConnection.createDataChannel("chat");

      this.peerConnection.oniceconnectionstatechange = () => console.log(`ICE STATE: ${this.peerConnection.iceConnectionState}`);
      this.peerConnection.onicegatheringstatechange = () => console.log(`ICE GATHERING STATE: ${this.peerConnection.iceGatheringState}`);

      this.peerConnection.onicecandidate = (event) => {

        if (event.candidate) this.onIceCandidate?.(event.candidate.toJSON());

      };

      this.peerConnection.ontrack = (event) => {

        if (event.streams && event.streams[0]) {

          this.remoteStream = event.streams[0];

          this.onTrack?.(this.remoteStream);

        }

      };

      if (this.localStream) {

        this.localStream.getTracks().forEach((track) => this.peerConnection.addTrack(track, this.localStream));

      }
          
      this.dataChannel.onmessage = (event) => this.onDataChannelMessage?.(event.data);

      this.peerConnection.ondatachannel = (event) => {
        
        event.channel.onmessage = (message) => {

          this.onDataChannelMessage?.(message.data);

        };

      };

    } catch (e) {

      console.error(e);

    }

  }

  async createOffer() {

    if (!this.peerConnection) return null;

    const offer = await this.peerConnection.createOffer();

    await this.peerConnection.setLocalDescription(offer);
    
    return offer;

  }

  async createAnswer() {

    if (!this.peerConnection) return null;

    const answer = await this.peerConnection.createAnswer();

    await this.peerConnection.setLocalDescription(answer);
    
    return answer;

  }

  async setRemoteDescription(description) {

    try {

      if (!this.peerConnection || !description.sdp || !description.type) return;

      const rtcSessionDescription = new RTCSessionDescription(description);

      await this.peerConnection.setRemoteDescription(rtcSessionDescription);
      
      this.remoteDescriptionSet = true;

      for (const candidate of this.pendingCandidates) {

        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

      }

      this.pendingCandidates = [];

    } catch (e) {

      console.error(e);

    }

  }

  async addCandidate(candidate) {

    try {

      if (!candidate || candidate.candidate === "") return;

      if (!this.peerConnection || !this.remoteDescriptionSet) {

        this.pendingCandidates.push(candidate);

      } else {

        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

      }

    } catch (e) {

      console.error(e);

    }

  }

  toggleAudio(enabled) {

    if (this.localStream) {

      this.localStream.getAudioTracks().forEach((track) => {

        track.enabled = enabled;

      });

    }

  }

  toggleVideo(enabled) {

    if (this.localStream) {

      this.localStream.getVideoTracks().forEach((track) => {

        track.enabled = enabled;

      });

    }

  }

  sendMessage(message) {

    if (this.dataChannel && this.dataChannel.readyState === "open") {

      this.dataChannel.send(message);

    }

  }

  hasLocalStreamError() {

    return !!this.localStreamError;

  }

  async close() {

    try {
      
      if (this.localStream) {

        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;

      }

      if (this.peerConnection) {

        this.peerConnection.close();
        this.peerConnection = null;

      }

      this.remoteStream = null;
      this.dataChannel = null;

      this.pendingCandidates = [];
      this.remoteDescriptionSet = false;

    } catch (e) {

      console.error(e);

    }

  }

}

export const webRTCService = new WebRTCService();
