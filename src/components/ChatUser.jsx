import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import VideoCallDialog from "./VideoCallDialog";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import useGetAllMessages from "@/hooks/useGetAllMessages";
import { toast } from "sonner";


const ChatUser = ({ user, isOnline, onBack }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const socket = useSelector((state) => state.socketio.socket);
  const { messages } = useSelector((state) => state.chat);
  const { user: loggedInUser } = useSelector((state) => state.auth);

  const { refetch } = useGetAllMessages(user._id);


  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      refetch();
    };

    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [socket, refetch]);

  const changeHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:8000/api/v1/message/send/${user._id}`,
        { message: text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        await refetch();
        setText("");
      }
    } catch (err) {
      
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pt-14 pb-10 md:py-0 h-screen bg-purple-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-pink-200 to-purple-300 shadow-md">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-2 text-purple-500 hover:text-purple-700 transition"
            >
              <ArrowLeft />
            </button>
          )}
          <Link to={`/profile/${user?._id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.profilepicture || "https://github.com/shadcn.png"}
              />
              <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link to={`/profile/${user?._id}`} className="cursor-pointer">
              <span className="font-semibold">{user?.username || "Unknown"}</span>
            </Link>
            <span
              className={`text-sm ${
                isOnline ? "text-green-500" : "text-gray-700"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <VideoCallDialog/>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-20 py-6 flex flex-col gap-3">
        {messages?.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl text-sm ${
              msg.senderId._id === loggedInUser._id
                ? "bg-purple-500 text-white self-end rounded-br-none"
                : "bg-white text-black self-start rounded-bl-none"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white flex gap-3 items-center shadow-md">
        <input
          type="text"
          value={text}
          onChange={changeHandler}
          placeholder="Message..."
          className="flex-1 px-4 py-2 bg-purple-100 rounded-full outline-none text-sm"
        />
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <button
            onClick={sendMessage}
            className="text-purple-600 hover:text-purple-800 text-xl"
          >
            ➤
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatUser;
