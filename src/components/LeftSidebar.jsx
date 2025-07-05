import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import { useState } from 'react';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import NotificationPopover from './NotificationPop';

const LeftSidebar = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false);
  const { likeNotification } = useSelector(state => state.realtimenotification)
  const { messages } = useSelector(state => state.messageNotification);
  const unseenMessagesCount = messages.filter(m => !m.seen).length;
  const unseenNotificationsCount = likeNotification.filter(n => !n.seen).length;


  const sidebar = [
    { icon: <Home />, text: 'Home' },
    // { icon: <Search />, text: 'Search' },
    // { icon: <TrendingUp />, text: 'Explore' },
    { icon: <Heart />, text: 'Notifications' },
    { icon: <MessageCircle />, text: 'Messages' },
    { icon: <PlusSquare />, text: 'Create' },
    {
      icon: (
        <Avatar className="h-6 w-6">
          <AvatarImage src={user?.profilepicture || "https://github.com/shadcn.png"} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: 'Profile',
    },
    { icon: <LogOut />, text: 'Logout' },
  ];

  const logoutHandler = async () => {
    try {
      const res = await axios.get("https://zocial-backend-m52y.onrender.com/api/v1/user/logout", { withCredentials: true })
      toast.success(res.data.message)
      dispatch(setAuthUser(null))
      dispatch(setPosts([]))
      dispatch(setSelectedPost(null))
      navigate("/login")
    }
    catch (error) {
      toast.error(error.response.data.message)
    }
  }

  const sidebarHandler = (text) => {

    if (text === "Logout") {
      logoutHandler()
    }
    else if (text === "Create") {
      setOpen(true)
    }
    else if (text === "Profile") {
      navigate(`/profile/${user._id}`)
    }
    else if (text === "Home") {
      navigate("/")
    }
    else if (text === "Messages") {

      navigate("/chat");
    }

  }

  return (
    <>
      {/* Desktop Sidebar (left vertical) */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:h-full lg:justify-between border-r px-4 py-6 z-20">
        <div className="space-y-4 ">
          <h1 className='text-4xl font-bold pl-5 text-purple-900 '>Zocial</h1>
          {sidebar.map((item, index) => (
            <div
              onClick={() => { sidebarHandler(item.text) }}
              key={index}
              className="flex items-center relative gap-3 text-gray-700 hover:text-black cursor-pointer px-3 py-2 rounded-md  transition"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-lg font-medium">{item.text}</span>
              {
                item.text === "Notifications" && (
                  <>
                    {unseenNotificationsCount > 0 && (
                      <span className="absolute left-6 bottom-6 bg-purple-500 text-white text-[13px] px-[6px] rounded-full">
                        {unseenNotificationsCount}
                      </span>
                    )}
                    <NotificationPopover likeNotification={likeNotification} />
                  </>
                )
              }

              {item.text === "Messages" && unseenMessagesCount > 0 && (
                <span className="absolute left-6 bottom-6 bg-purple-500 text-white text-[13px] px-[6px] rounded-full">
                  {unseenMessagesCount}
                </span>
              )}

            </div>
          ))}
        </div>
      </div>
      {/* Mobile top logo */}
      <div className='lg:hidden fixed top-0 left-0 right-0 z-50  border-b flex justify-around items-center py-2  bg-purple-200'>
        <h1 className='text-4xl font-bold pl-5 text-purple-900 '>Zocial</h1>
      </div>

      {/* Mobile Bottom Navigation */}

      <div className="fixed bottom-0 left-0 right-0 z-50  border-t flex justify-around items-center py-2 lg:hidden bg-purple-200">

        {sidebar.map((item, index) => (
          <div
            onClick={() => { sidebarHandler(item.text) }}
            key={index}
            className="flex flex-col items-center relative text-gray-700 hover:text-black cursor-pointer "
          >
            <span className="text-xl">{item.icon}</span>
            {
              item.text === "Notifications"  && (
                <>
                  {unseenNotificationsCount > 0 && (
                    <span className="absolute left-3 bottom-3 bg-purple-500 text-white text-[13px] px-[6px] rounded-full">
                      {unseenNotificationsCount}
                    </span>
                  )}
                  <NotificationPopover likeNotification={likeNotification} />
                </>
              )
            }

            {item.text === "Messages" && unseenMessagesCount > 0 && (
              <span className="absolute left-3 bottom-3 bg-purple-500 text-white text-[13px] px-[6px] rounded-full">
                {unseenMessagesCount}
              </span>)}

          </div>
        ))}
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </>
  );
};

export default LeftSidebar;
