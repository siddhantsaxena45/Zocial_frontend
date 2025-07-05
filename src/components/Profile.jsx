import useGetUserProfile from '@/hooks/useGetUserProfile';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { setAuthUser, updateUserProfile } from '@/redux/authSlice';
import { Heart, MessageCircle } from "lucide-react"; //
import { toast } from 'sonner';
import { useDispatch } from "react-redux";
import axios from "axios";
const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
const dispatch = useDispatch();
  const { userProfile, user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('posts');
  const isloggedIn = user?._id && userProfile?._id && user._id === userProfile._id;
  if (!userProfile) {
    return <div className="pt-20 text-center">Loading profile...</div>;
  }


  const handleTab = (tab) => {
    setActiveTab(tab)
  }


const handleFollow = async () => {
  try {
    const res = await axios.post(
      `https://zocial-backend-m52y.onrender.com/api/v1/user/followorunfollow/${userProfile._id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (res.data.success) {
      toast.success(res.data.message);

      const wasFollowing = user?.following?.includes(userProfile._id);

      const updatedFollowers = wasFollowing
        ? userProfile.followers.filter((id) => id !== user._id)
        : [...userProfile.followers, user._id];

      const updatedFollowing = wasFollowing
        ? user.following.filter((id) => id !== userProfile._id)
        : [...user.following, userProfile._id];

      dispatch(
        updateUserProfile({
          ...userProfile,
          followers: updatedFollowers,
        })
      );

      dispatch(
        setAuthUser({
          ...user,
          following: updatedFollowing,
        })
      );
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Action failed");
  }
};



  const displayPosts = (activeTab === 'posts'
    ? [...(userProfile?.posts || [])]
    : [...(userProfile?.bookmarks || [])]
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const isFollowingNow = user?.following?.includes(userProfile?._id);
  return (
    <div className="min-h-screen w-full flex justify-center lg:pl-60 pt-20 pb-20 ">

      <div className=" max-w-6xl flex flex-col gap-6 items-center ">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3 w-full ">


          <section className="flex justify-center items-center ">
            <Avatar className="h-20 w-20 md:h-40 md:w-40">
              <AvatarImage
                src={userProfile?.profilepicture || "https://github.com/shadcn.png"}
                className="object-cover w-full h-full"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>


          <section className="flex flex-col justify center items-center md:items-start gap-4 p-4">
            <div className="flex flex-col md:flex-row justify center items-center gap-3 sm:gap-6">
              <span className="font-bold text-xl text-center">{userProfile?.username}</span>
              <div className="flex gap-2 flex-wrap items-center justify-center">
                {!isloggedIn && <>
                  {!isFollowingNow ? (
                    <Button
                      className="bg-[#0095f6] hover:bg-blue-400 text-sm px-4"
                      onClick={handleFollow}
                    >
                      Follow
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 text-sm px-4"
                        onClick={handleFollow}
                      >
                        Unfollow
                      </Button>
                      <Link to={`/chat`}><Button variant="secondary" className="hover:bg-gray-200 text-sm px-4">Message</Button></Link>
                      
                    </>
                  )}
                </>
                }
                {isloggedIn && <>
                  <Link to="/account/edit"> <Button variant="secondary" className="hover:bg-gray-200 text-sm px-4">Edit Profile</Button></Link>
                  
                </>
                }
              </div>

            </div>


            <div className='flex gap-2 justify-center md:justify-start'>
              <span className="font-semibold text-sm">Posts: {userProfile?.posts?.length}</span>
              <span className="font-semibold text-sm">Followers: {userProfile?.followers?.length}</span>
              <span className="font-semibold text-sm">Following: {userProfile?.following?.length}</span>
            </div>
            {/* Bio */}
            <p className=" text-md text-center md:text-left">
              {userProfile.bio || "bio here ..."}
            </p>


          </section>
        </div>
        <div className='h-[1px] w-full bg-white'></div>
        <div className='flex justify-center items-center gap-5'>
          <span className={`cursor-pointer ${activeTab === "posts" ? "font-bold" : ""} `} onClick={() => handleTab("posts")}>Posts</span>
          <span className={`cursor-pointer ${activeTab === "saved" ? "font-bold" : ""} `} onClick={() => handleTab("saved")}>Saved</span>

        </div>

        {/* Posts */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {displayPosts?.map((post) => (
            <div key={post._id} className="relative group w-full aspect-square overflow-hidden rounded-md shadow-sm hover:scale-[1.02] transition-all duration-200">
              <img
                src={post.image}
                alt="Post"
                className="w-full h-full object-cover"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-300 flex justify-center items-center">
                <div className="gap-4 justify-center items-center text-white hidden group-hover:flex">
                  <div className="flex items-center gap-1">
                    <Heart className="text-lg" />
                    <span>{post?.likes?.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="text-lg" />
                    <span>{post?.comments?.length}</span>
                  </div>
                </div>
              </div>
            </div>

          ))}
        </div>

      </div>
    </div >
  );
};

export default Profile;
