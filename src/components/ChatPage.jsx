import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import ChatUser from './ChatUser';
import { setSelectedUser } from '@/redux/authSlice';
import { MessageCircle } from 'lucide-react';


const ChatPage = () => {
  const { suggestedUsers } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);
  const { selectedUser } = useSelector(state => state.auth)
  const { onlineUsers } = useSelector(state => state.chat)
  const dispatch = useDispatch()
  const { messages } = useSelector((state) => state.messageNotification);

  const unseenCounts = {};

  messages.forEach((msg) => {
    const sender = msg.senderId?._id || msg.senderId; // Sometimes it's populated, sometimes plain ID
    if (!msg.seen) {
      unseenCounts[sender] = (unseenCounts[sender] || 0) + 1;
    }
  });
  const latestTimestamps = {};

  messages.forEach((msg) => {
    const sender = msg.senderId?._id || msg.senderId;
    const timestamp = new Date(msg.createdAt).getTime();
    if (!latestTimestamps[sender] || timestamp > latestTimestamps[sender]) {
      latestTimestamps[sender] = timestamp;
    }
  });
  const sortedUsers = [...suggestedUsers].sort((a, b) => {
    const aUnseen = unseenCounts[a._id] || 0;
    const bUnseen = unseenCounts[b._id] || 0;

    if (aUnseen !== bUnseen) {
      // Higher unseen count first
      return bUnseen - aUnseen;
    }

    const aTime = latestTimestamps[a._id] || 0;
    const bTime = latestTimestamps[b._id] || 0;

    // More recent messages first
    return bTime - aTime;
  });


  return (
    <div className="flex h-screen w-full lg:pl-60 overflow-hidden relative pt-14 pb-10 lg:py-0">
      {/* 📱 Mobile Full-Screen Chat */}
      {selectedUser && (
        <div className="md:hidden fixed inset-0 z-10 bg-purple-100">
          <ChatUser user={selectedUser} isOnline={onlineUsers.includes(selectedUser._id)} onBack={() => dispatch(setSelectedUser(null))} />
        </div>
      )}

      {/* 👈 Left Sidebar (Always visible) */}
      <div className="w-full md:w-80 border-r border-gray-200 bg-gradient-to-b from-pink-200 to-purple-300 shadow-sm flex flex-col">
        <h1 className="text-lg font-semibold px-4 py-4 border-b">Messages</h1>

        <div className="overflow-y-auto flex-1 h-full">
          {sortedUsers.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            return (

              <div
                key={u._id}
                onClick={() => {
                  dispatch(setSelectedUser(u))
                  const updatedMessages = messages.map(msg => {
                    const sender = msg.senderId?._id || msg.senderId;
                    if (sender === u._id) {
                      return { ...msg, seen: true };
                    }
                    return msg;
                  });

                  dispatch({ type: "messageNotification/setAllMessages", payload: updatedMessages });
                }
                }
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-purple-100 ${selectedUser?._id === u._id ? 'bg-purple-200' : ''
                  }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={u.profilepicture || "https://github.com/shadcn.png"} />
                  <AvatarFallback>{u.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{u.username}</span>
                  <span className={`text-xs ${isOnline ? "text-green-500" : "text-gray-700"}`}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
                {unseenCounts[u._id] > 0 && (
                  <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                    {unseenCounts[u._id]} new
                  </span>
                )}
              </div>
            )
          }
          )}
        </div>
      </div>

      {/* 💬 Right Chat Panel (Desktop only) */}
      <div className="hidden md:flex flex-1 bg-purple-100">
        {selectedUser ? (
          <ChatUser user={selectedUser} isOnline={onlineUsers.includes(selectedUser._id)} onBack={() => dispatch(setSelectedUser(null))} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-700 w-full">
            <MessageCircle className='mr-2 h-20 w-20' /> Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
