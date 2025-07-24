import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Signup from "./components/Signup"
import Login from "./components/Login"
import MainLayout from "./components/MainLayout"
import Home from "./components/Home"
import Profile from "./components/Profile"
import EditProfile from "./components/EditProfile"
import ChatPage from "./components/ChatPage"
import { io } from "socket.io-client"
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice"
import { setOnlineUsers } from "./redux/chatSlice"
import { setLikeNotification } from "./redux/rtnSlice"
import { setMessageNotification } from "./redux/messageNotificationSlice";
import ProtectedRoutes from "./components/ProtectedRoutes"
import { GoogleOAuthProvider } from '@react-oauth/google';

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element:<ProtectedRoutes> <MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: "/",
        element:<Home />
      }, {
        path: "/profile/:id",
        element:  <Profile />
      }, {
        path: "/account/edit",
        element:  <EditProfile />
      },
      {
        path: "/chat",
        element:  <ChatPage />
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
  useEffect(() => {
    if (user) {
      const socketio = io("https://zocial-backend-m52y.onrender.com", {
        query: {
          userId: user._id
        },
        
      })
      dispatch(setSocket(socketio))
      socketio.on("getOnlineUsers", (onlineUser) => {
        dispatch(setOnlineUsers(onlineUser));
      });
      socketio.on("notification", (notification) => {
        dispatch(setLikeNotification(notification));
      });
      socketio.on("message", (message) => {
        dispatch(setMessageNotification(message));
      });


      return () => {
        socketio.disconnect();
        dispatch(setSocket(null))

      }
    } else if (socket) {
      socket.disconnect();
      dispatch(setSocket(null))

    }

  }, [user, dispatch])

  return (
    <>
     <GoogleOAuthProvider clientId="51124827144-tlbnav5dcfmcq51fjq9v1e73smetc2jr.apps.googleusercontent.com"><RouterProvider router={browserRouter} /></GoogleOAuthProvider>
      
    </>
  )
}

export default App