import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Signup from "./components/Signup"
import Login from "./components/Login"
import MainLayout from "./components/MainLayout"
import Home from "./components/Home"
import Profile from "./components/Profile"
import EditProfile from "./components/EditProfile"
import ChatPage from "./components/ChatPage"
import { io } from "socket.io-client"
import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setSocket } from "./redux/socketSlice"
import { setOnlineUsers } from "./redux/chatSlice"
import { setLikeNotification } from "./redux/rtnSlice"
import { setMessageNotification } from "./redux/messageNotificationSlice"
import ProtectedRoutes from "./components/ProtectedRoutes"

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/profile/:id",
        element: <Profile />
      },
      {
        path: "/account/edit",
        element: <EditProfile />
      },
      {
        path: "/chat",
        element: <ChatPage />
      }
    ]
  },
  {
    path: "/register",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  }
])

function App() {
  const { user } = useSelector(state => state.auth)
  const { socket } = useSelector(state => state.socketio)
  const dispatch = useDispatch()

  // Helper function to end calls (you'll need to implement this based on your call state management)
  const endCall = (shouldNotify = true) => {
    // Implement your call ending logic here
    // This might involve updating Redux state, stopping media streams, etc.
    console.log("Ending call, notify:", shouldNotify)
    
    // Example implementation (adjust based on your actual call state management):
    // dispatch(setCallState({ isInCall: false, callId: null, remoteUser: null }))
    // if (localStream) {
    //   localStream.getTracks().forEach(track => track.stop())
    // }
  }

  useEffect(() => {
    if (user) {
      const socketio = io("https://zocial-backend-m52y.onrender.com", {
        query: {
          userId: user._id
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      dispatch(setSocket(socketio))

      // Existing socket event handlers
      socketio.on("getOnlineUsers", (onlineUser) => {
        dispatch(setOnlineUsers(onlineUser))
      })

      socketio.on("notification", (notification) => {
        dispatch(setLikeNotification(notification))
      })

      socketio.on("message", (message) => {
        dispatch(setMessageNotification(message))
      })

      // Enhanced call-related event handlers
      socketio.on("call-error", ({ error, code, from, to }) => {
        console.error("Call error:", error, "Code:", code)
        
        // Show user-friendly error message
        const errorMessages = {
          'USER_NOT_FOUND': 'User not found or offline',
          'USER_BUSY': 'User is currently busy',
          'CALL_REJECTED': 'Call was rejected',
          'NETWORK_ERROR': 'Network connection error',
          'PERMISSION_DENIED': 'Media permissions denied',
          'UNKNOWN_ERROR': 'An unknown error occurred'
        }
        
        const userMessage = errorMessages[code] || errorMessages['UNKNOWN_ERROR']
        alert(`Call failed: ${userMessage}`)
        endCall(false)
      })

      socketio.on("call-timeout", ({ from, to, duration }) => {
        console.log("Call timed out after", duration, "ms")
        alert("Call timed out - no response from the other user")
        endCall(false)
      })

      socketio.on("server-shutdown", ({ message, gracePeriod }) => {
        console.log("Server shutting down:", message)
        const shutdownMessage = gracePeriod 
          ? `Server is shutting down in ${gracePeriod}ms. Your call will be ended.`
          : "Server is shutting down. Call will be ended."
        alert(shutdownMessage)
        endCall(false)
      })

      socketio.on("webrtc-heartbeat", ({ from, status, timestamp, connectionQuality }) => {
        console.log("WebRTC heartbeat from:", from, "status:", status, "quality:", connectionQuality)
        
        // You can use this to monitor connection quality and update UI
        if (connectionQuality === 'poor') {
          console.warn("Poor connection quality detected")
          // You might want to show a warning to the user
          // dispatch(setConnectionQuality('poor'))
        } else if (connectionQuality === 'good') {
          // dispatch(setConnectionQuality('good'))
        }
      })

      // Additional useful socket event handlers
      socketio.on("user-disconnected", ({ userId, reason }) => {
        console.log("User disconnected:", userId, "reason:", reason)
        if (reason === 'network-error') {
          // Handle network disconnection during call
          alert("The other user lost connection")
          endCall(false)
        }
      })

      socketio.on("call-quality-warning", ({ from, issue, severity }) => {
        console.warn("Call quality warning:", issue, "severity:", severity)
        
        if (severity === 'high') {
          // Show warning to user about call quality
          const warningMessage = issue === 'high-latency' 
            ? "High latency detected. Call quality may be poor."
            : "Connection issues detected. Call quality may be affected."
          
          // You might want to show a non-blocking notification instead of alert
          console.warn(warningMessage)
          // dispatch(showCallQualityWarning(warningMessage))
        }
      })

      socketio.on("reconnect", (attemptNumber) => {
        console.log("Reconnected to server after", attemptNumber, "attempts")
        // You might want to refresh certain data or notify the user
      })

      socketio.on("reconnect_failed", () => {
        console.error("Failed to reconnect to server")
        alert("Lost connection to server. Please refresh the page.")
      })

      // Connection event handlers
      socketio.on("connect", () => {
        console.log("Connected to server")
      })

      socketio.on("disconnect", (reason) => {
        console.log("Disconnected from server:", reason)
        if (reason === 'io server disconnect') {
          // Server disconnected the socket, try to reconnect
          console.log("Server disconnected, attempting to reconnect...")
        }
      })

      socketio.on("connect_error", (error) => {
        console.error("Connection error:", error)
      })

      return () => {
        // Clean up all event listeners
        socketio.off("getOnlineUsers")
        socketio.off("notification")
        socketio.off("message")
        socketio.off("call-error")
        socketio.off("call-timeout")
        socketio.off("server-shutdown")
        socketio.off("webrtc-heartbeat")
        socketio.off("user-disconnected")
        socketio.off("call-quality-warning")
        socketio.off("reconnect")
        socketio.off("reconnect_failed")
        socketio.off("connect")
        socketio.off("disconnect")
        socketio.off("connect_error")
        
        socketio.disconnect()
        dispatch(setSocket(null))
      }
    } else if (socket) {
      socket.disconnect()
      dispatch(setSocket(null))
    }
  }, [user, dispatch])

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App