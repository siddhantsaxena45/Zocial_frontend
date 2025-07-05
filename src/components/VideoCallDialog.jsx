import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  VideoIcon,
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Repeat,
} from "lucide-react";
import { useSelector } from "react-redux";

const VideoCall = () => {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [facingMode, setFacingMode] = useState("user");
  const [callStarted, setCallStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const iceCandidatesBuffer = useRef([]);

  const { socket } = useSelector((state) => state.socketio);
  const { user: loggedInUser, selectedUser } = useSelector((state) => state.auth);

  // ICE servers configuration for better connectivity
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const startCall = async () => {
    if (callStarted || loading || !selectedUser?._id) return;

    setLoading(true);
    try {
      setCallStarted(true);
      setOpen(true);

      // Get user media with error handling
      localStream.current = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode }, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      // Create peer connection with ICE servers
      const pc = new RTCPeerConnection(iceServers);
      
      // Add tracks to peer connection
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current);
      });

      // Handle remote stream
      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("ice-candidate", {
            to: selectedUser._id,
            candidate: e.candidate,
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'failed') {
          endCall(false); // Don't notify other side on connection failure
        }
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket) {
        socket.emit("video-offer", {
          to: selectedUser._id,
          offer: pc.localDescription,
        });
      }

      peerConnection.current = pc;
    } catch (err) {
      console.error("Error starting call:", err);
      endCall(false); // Don't notify on error
    } finally {
      setLoading(false);
    }
  };

  const acceptCall = async () => {
    if (!callerInfo) return;
    
    setIncomingCall(false);
    setCallStarted(true);
    setOpen(true);

    try {
      const { from, offer } = callerInfo;
      
      // Get user media
      localStream.current = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode }, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      // Create peer connection
      const pc = new RTCPeerConnection(iceServers);
      
      // Add tracks
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current);
      });

      // Handle remote stream
      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("ice-candidate", {
            to: from,
            candidate: e.candidate,
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'failed') {
          endCall(false); // Don't notify other side on connection failure
        }
      };

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Add buffered ICE candidates
      for (const candidate of iceCandidatesBuffer.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
      iceCandidatesBuffer.current = [];

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socket) {
        socket.emit("video-answer", {
          to: from,
          answer,
        });
      }

      peerConnection.current = pc;
    } catch (err) {
      console.error("Error accepting call:", err);
      endCall(false); // Don't notify on error
    }
  };

  const rejectCall = () => {
    if (callerInfo?.from && socket) {
      socket.emit("call-rejected", { to: callerInfo.from });
    }
    setIncomingCall(false);
    setCallerInfo(null);
  };

  const endCall = (shouldNotifyOther = true) => {
    // Notify the other person that call ended
    if (shouldNotifyOther && socket && (selectedUser?._id || callerInfo?.from)) {
      const targetUserId = selectedUser?._id || callerInfo?.from;
      socket.emit("call-ended", { to: targetUserId });
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Stop all tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset state
    setOpen(false);
    setCallStarted(false);
    setMuted(false);
    setCameraOn(true);
    setFacingMode("user");
    setCallerInfo(null);
    setIncomingCall(false);
    iceCandidatesBuffer.current = [];
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }
  };

  const toggleCamera = () => {
    const newCamera = !cameraOn;
    setCameraOn(newCamera);
    
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = newCamera;
      });
    }
  };

  const switchCamera = async () => {
    if (!localStream.current || !peerConnection.current) return;

    try {
      // Stop current video tracks only (keep audio tracks)
      localStream.current.getVideoTracks().forEach((track) => track.stop());

      // Get new video stream only with opposite facing mode
      const newFacingMode = facingMode === "user" ? "environment" : "user";
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false, // Don't get new audio
      });

      // Apply current camera state to new video tracks
      newVideoStream.getVideoTracks().forEach((track) => {
        track.enabled = cameraOn;
      });

      // Replace only the video track in peer connection
      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      const videoSender = peerConnection.current.getSenders().find((s) => 
        s.track && s.track.kind === "video"
      );
      
      if (videoSender) {
        await videoSender.replaceTrack(newVideoTrack);
      }

      // Create new combined stream with existing audio and new video
      const combinedStream = new MediaStream([
        ...localStream.current.getAudioTracks(), // Keep existing audio tracks
        ...newVideoStream.getVideoTracks() // Add new video tracks
      ]);

      // Update local stream and video element
      localStream.current = combinedStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = combinedStream;
      }

      setFacingMode(newFacingMode);
    } catch (err) {
      console.error("Error switching camera:", err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleVideoOffer = ({ from, offer }) => {
      setIncomingCall(true);
      setCallerInfo({ from, offer });
    };

    const handleVideoAnswer = async ({ answer }) => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("Set answer failed:", err);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (peerConnection.current?.remoteDescription?.type) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        iceCandidatesBuffer.current.push(candidate);
      }
    };

    const handleCallRejected = () => {
      alert("Call was rejected.");
      endCall(false); // Don't notify back when we receive rejection
    };

    const handleCallEnded = () => {
      endCall(false); // Don't notify back when we receive call-ended
    };

    // Add event listeners
    socket.on("video-offer", handleVideoOffer);
    socket.on("video-answer", handleVideoAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);

    // Cleanup
    return () => {
      socket.off("video-offer", handleVideoOffer);
      socket.off("video-answer", handleVideoAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall(false); // Don't notify on component unmount
    };
  }, []);

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <p className="text-white">Starting call...</p>
        </div>
      )}

      <VideoIcon 
        onClick={startCall} 
        className="w-8 h-8 text-purple-500 hover:text-purple-800 cursor-pointer transition-colors" 
      />

      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center gap-6">
          <p className="text-white text-lg">Incoming video call...</p>
          <div className="flex gap-4">
            <Button 
              onClick={acceptCall} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Accept
            </Button>
            <Button 
              onClick={rejectCall} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={(val) => !val && endCall(true)}>
        <DialogContent
          aria-labelledby="video-call-description"
          className="w-full max-w-2xl p-6 sm:p-8 bg-black text-white rounded-xl overflow-hidden z-[999]"
        >
          <DialogHeader>
            <DialogTitle id="video-call-description" className="text-white text-center text-lg">
              Video Call
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 h-[400px]">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline
              className="rounded-md border w-full h-full object-cover bg-black" 
            />
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline
              className="rounded-md border w-full h-full object-cover bg-black" 
            />
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button 
              onClick={() => endCall(true)} 
              className="bg-red-500 hover:bg-red-600 text-white w-full"
            >
              <PhoneOff className="mr-2 h-4 w-4" /> End
            </Button>
            <Button 
              onClick={toggleMute} 
              className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            >
              {muted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />} 
              {muted ? "Unmute" : "Mute"}
            </Button>
            <Button 
              onClick={toggleCamera} 
              className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            >
              {cameraOn ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />} 
              {cameraOn ? "Off" : "On"}
            </Button>
            <Button 
              onClick={switchCamera} 
              className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            >
              <Repeat className="mr-2 h-4 w-4" /> Flip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoCall;