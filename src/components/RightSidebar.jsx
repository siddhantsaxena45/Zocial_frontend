import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';

const RightSidebar = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div 
      className="
        flex flex-col 
        justify-start 
        items-start 
        gap-4 
        w-[350px]         // ⬅️ Increased width
        max-h-[calc(100vh-100px)] // ⬅️ Max height to allow scrolling
        overflow-y-auto    // ⬅️ Enables vertical scrolling
        mt-4 
        p-4 
        mr-10
        scrollbar-thin     // Optional: Tailwind scrollbar styling
        scrollbar-thumb-gray-400
      "
    >
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user?._id}`} className="cursor-pointer">
          <Avatar className="h-10 w-10 rounded-full overflow-hidden">
            <AvatarImage src={user?.profilepicture || "https://github.com/shadcn.png"} className="w-full h-full object-cover" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col justify-center items-start w-full">
          <span className="font-semibold text-sm truncate">
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </span>
          <span className="text-xs text-gray-700 truncate">
            {user?.bio || "bio here ..."}
          </span>
        </div>
      </div>
      <SuggestedUsers />
    </div>
  );
};

export default RightSidebar;
