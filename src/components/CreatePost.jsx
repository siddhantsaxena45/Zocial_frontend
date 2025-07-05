import {
  Dialog,
  DialogContent,
  DialogHeader,

} from "@/components/ui/dialog"
import React, { useRef, useState } from 'react'
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Textarea } from "./ui/textarea";
import { readFileAsDataURL } from "@/lib/utils";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { addUserPost } from "@/redux/authSlice";


const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const {user}=useSelector(state=>state.auth)
  const {posts}=useSelector(state=>state.post)
  const dispatch=useDispatch()

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const previewUrl = await readFileAsDataURL(file);
      setPreview(previewUrl);
    }
  }

  const createPostHandler = async () => {

    try {
      const formdata = new FormData()
      formdata.append("caption", caption)
      if (file) {
        formdata.append("image", file)
      }
      setLoading(true)
      let response = await axios.post("https://zocial-backend-m52y.onrender.com/api/v1/post/addpost", formdata,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true
        })
      if (response.data.success) {
        toast.success(response.data.message)
        dispatch(setPosts([ response.data.post,...posts]))
      dispatch(addUserPost(response.data.post));
      setCaption('');
  setFile('');
  setPreview('');
        setOpen(false)
      }
    }
    catch (error) {
      toast.error(error.response.data.message)
    } finally {
      setLoading(false)
    }
  }



  return (

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
       className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl h-[60vh] sm:h-auto max-h-[90vh] overflow-y-auto rounded-xl p-6"

      >
        <DialogHeader className="text-center text-lg font-semibold mb-4">
          Create new Post
        </DialogHeader>

        {/* User Info */}
        <div className="flex gap-4 items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profilepicture || "https://github.com/shadcn.png"} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h1 className="font-medium text-sm">{user?.username}</h1>
            <span className="text-xs text-gray-500">{user?.bio}</span>
          </div>
        </div>

        {/* Caption */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption here..."
          className="mt-4 text-sm focus-visible:ring-transparent"
          rows={4}
        />
        {
          preview && (
            <img src={preview} alt="preview" className="mt-2 w-[90%] h-64 mx-auto object-cover rounded-md " />
          )
        }

        {/* File upload */}
        <input type="file" hidden ref={imageRef} onChange={fileChangeHandler} />
        <button
          className="bg-purple-400 hover:bg-purple-700 text-white px-4 py-2 rounded-md mt-2 text-sm transition md:w-1/2 mx-auto"
          onClick={() => imageRef.current.click()}
        >
          Select from computer
        </button>
        {preview && (
          loading ? (
            <Button className="m-2 w-1/2 py-2 mx-auto">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </Button>
          ) : (
            <Button type="submit" className="m-2 w-1/2 mx-auto py-2" onClick={createPostHandler}>Post</Button>
          ))}
      </DialogContent>
    </Dialog >
  )
}

export default CreatePost
