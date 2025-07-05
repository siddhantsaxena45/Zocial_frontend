import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { markAllNotificationsSeen } from "@/redux/rtnSlice";
import { useDispatch } from "react-redux";
const NotificationPopover = ({ likeNotification = [] }) => {
  const dispatch = useDispatch();

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          dispatch(markAllNotificationsSeen());
        }
      }}
    >
      <PopoverTrigger asChild>
        {likeNotification.filter(n => !n.seen).length === 0 ? (
          <button
          className="flex items-center justify-center rounded-full h-8 w-8 absolute   transparent"
        >
          
        </button>
        ):(<button
          className="flex items-center justify-center rounded-full h-5 w-5 absolute bottom-3 left-3 md:bottom-6 md:left-6 bg-purple-600 text-white text-xs"
        >
          {likeNotification.filter(n => !n.seen).length}
        </button>)}
      </PopoverTrigger>
      <PopoverContent className="w-72 max-h-72 overflow-y-auto p-4 bg-white shadow-xl rounded-lg space-y-2">
        {likeNotification.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">
            No new notifications
          </p>
        ) : (
          [...likeNotification]
            .reverse() // sort newest first
            .map((notification) => (
              <div
                key={notification.userId + notification.postId + notification.timestamp}
                className={`flex items-center gap-3 p-2 rounded-md transition-all ${!notification.seen ? "bg-purple-50" : "hover:bg-gray-100"
                  }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={notification.userDetails?.profilepicture || "https://github.com/shadcn.png"}
                    alt={notification.userDetails?.username || "User"}
                  />
                  <AvatarFallback>
                    {notification.userDetails?.username?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">
                    {notification.userDetails?.username}
                  </span>{" "}
                  liked your post
                </p>
              </div>
            ))
        )}
      </PopoverContent>
    </Popover>
  );
};


export default NotificationPopover;
