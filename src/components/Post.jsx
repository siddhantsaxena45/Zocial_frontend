import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { FaBookmark, FaHeart, FaRegHeart } from "react-icons/fa";

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button'
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import axios from 'axios';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { updateBookmarks } from '@/redux/authSlice';
import { Link } from 'react-router-dom';


const Post = ({ post }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { posts } = useSelector(state => state.post)
    const [text, setText] = useState("")
    const [open, setOpen] = useState(false)
    const [isliked, setIsLiked] = useState(post.likes.includes(user._id) || false)
    const [postlikes, setPostLikes] = useState(post.likes.length)
    


    const isAuthor = user && (user._id === post.author?._id || user._id === post.author);

    const handleChange = (e) => {
        let inputText = e.target.value
        if (inputText.trim()) {
            setText(inputText)
        } else {
            setText("")
        }
    }
    const deletePostHandler = async (id) => {

        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${id}`, { withCredentials: true })

            if (res.data.success) {
                const newPosts = posts.filter(postitem => postitem._id !== id)
                dispatch(setPosts(newPosts))
                toast.success(res.data.message)
            }

        } catch (err) {
            toast.error(err.response.data.message)
        }
    }
    const likeordislike = async (id) => {

        try {
            const action = isliked ? "dislike" : "like"
            const res = await axios.get(`http://localhost:8000/api/v1/post/${id}/${action}`, { withCredentials: true })
            if (res.data.success) {
                let updatedlikes = isliked ? postlikes - 1 : postlikes + 1
                let updatedPosts = posts.map(postitem => {
                    if (postitem._id === id) {
                        return { ...postitem, likes: isliked ? postitem.likes.filter(like => like !== user._id) : [...postitem.likes, user._id] }
                    }
                    return postitem
                })
                dispatch(setPosts(updatedPosts))
                setIsLiked(!isliked)
                setPostLikes(updatedlikes)
                toast.success(res.data.message)
            }

        }

        catch (err) {
            toast.error(err.response.data.message)
        }
    }

const handleShare = async (imageUrl) => {
    try {
        await navigator.clipboard.writeText(imageUrl);
        toast.success("Post link copied to clipboard!");
    } catch (err) {
        toast.error("Failed to copy post link");
    }
};


    const commentHandler = async () => {
        try {
            const res = await axios.post(
                `http://localhost:8000/api/v1/post/${post._id}/comment`,
                { comment: text },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            if (res.data.success) {
                const newComment = res.data.comment;

                // Create a new post object with the added comment
                const updatedPost = {
                    ...post,
                    comments: [...post.comments, newComment],
                };

                // Update global posts state
                const updatedPosts = posts.map((p) =>
                    p._id === post._id ? updatedPost : p
                );

                dispatch(setPosts(updatedPosts));

                setText("");
                toast.success(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to comment");
        }
    };

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/bookmark`, { withCredentials: true })
            if (res.data.success) {
                // Update the Redux posts array
                const updatedBookmarks = res.data.bookmarks;

                // Update Redux user state
                dispatch(updateBookmarks(updatedBookmarks));

                toast.success(res.data.message);
            }
        }
        catch (error) {
            toast.error(error.response.data.message)
        }

    }

    return (
        <div className="bg-gradient-to-br from-pink-400 to-violet-300 shadow-md rounded-xl overflow-hidden max-w-xl mb-6 border text-black">
            {/* Post header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                    <Link to={`/profile/${post.author?._id}`} className="cursor-pointer">
                        <AvatarImage src={post.author?.profilepicture || "https://github.com/shadcn.png"} className='w-full h-full object-cover' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Link>
                    </Avatar>
                    <div className='flex items-center gap-2'>
                        <h1 className="text-sm font-semibold">{post.author?.username}</h1>
                        {user && user._id === post.author._id && <Badge variant="secondary">Author</Badge>}
                    </div>
                </div>

              {isAuthor &&  <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col  items-center text-sm text-center ">
                       

                         <Button variant="ghost" className="w-full cursor-pointer focus-visible:ring-transparent text-[#ed4956]" onClick={() => { deletePostHandler(post._id) }}>Delete</Button>

                    </DialogContent>
                </Dialog> }
            </div>

            {/* Post image */}
            <img
                className="w-full object-cover aspect-square"
                src={post.image}
                alt="Post"
            />
            <div className='p-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex gap-4 items-center justify-between '>
                        {isliked ? <FaHeart className='text-2xl text-[#ed4956]' onClick={() => { likeordislike(post._id) }} /> : <FaRegHeart className='text-2xl  ' onClick={() => { likeordislike(post._id) }} />
                        }

                        <MessageCircle onClick={() => { setOpen(true), dispatch(setSelectedPost(post)) }} className='cursor-pointer' />
                            <Send onClick={() => handleShare(post.image)} className="cursor-pointer" />


                    </div>
                    <div className='flex gap-4 items-center justify-between '>
                        {user?.bookmarks?.includes(post._id) ? <FaBookmark className='text-2xl text-[#a949ed]' onClick={bookmarkHandler} /> : <Bookmark className='text-2xl ' onClick={bookmarkHandler} />}


                    </div>

                </div>
                <div className=''>{postlikes} likes</div>
                <div className=''>
                    <span className='font-bold text-sm mr-2'>{post.author?.username}</span>
                    <span className='text-lg'>{post.caption}</span>
                </div>
                {post.comments.length > 0 &&
                    <span onClick={() => { dispatch(setSelectedPost(post)), setOpen(true) }} className='cursor-pointer hover:text-[#3BADF8] text-gray-800'>view all {post.comments.length} comments </span>}
                <CommentDialog open={open} setOpen={setOpen}
                />
                <div className='flex text-center gap-4'>
                    <input
                        onChange={handleChange}
                        name="comment"
                        value={text}
                        type="text" placeholder='add a comment ...' className='outline-none  w-full bg-transparent placeholder:text-gray-700' />
                    {text && <span className='text-[#3BADF8] cursor-pointer ' onClick={commentHandler}>post</span>}

                </div>
            </div>
        </div>
    )
}

export default Post
