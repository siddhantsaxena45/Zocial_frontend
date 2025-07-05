import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { readFileAsDataURL } from "@/lib/utils";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';
import axios from 'axios';
const EditProfile = () => {
    const { user } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(false);
    const imageRef = useRef()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [inputData, setInputData] = useState(
        {
            profilephoto: user?.profilepicture,
            bio: user?.bio,
            gender: user?.gender
        }

    )
    const [preview, setPreview] = useState(user?.profilepicture || "");

    const fileHandler = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = await readFileAsDataURL(file);
            setPreview(previewUrl);
            setInputData({
                ...inputData,
                profilephoto: file
            });
        }
    };

    const selectChangeHandler = (value) => {
        setInputData({
            ...inputData,
            gender: value
        })
    }
    const editProfileHandler = async (e) => {
        const formData = new FormData()
        if (inputData.profilephoto) {

            formData.append("profilephoto", inputData.profilephoto)
        }
        formData.append("bio", inputData.bio)
        formData.append("gender", inputData.gender)

        try {
            setLoading(true)
            let response = await axios.post("https://zocial-backend-m52y.onrender.com/api/v1/user/profile/edit", formData, {
                headers: { "Content-Type": "multipart/form-data" },

                withCredentials: true
            })
            if (response.data.success) {
                const updatedUser = {
                    ...user,
                    profilepicture: response.data.user.profilepicture,
                    bio: response.data.user.bio,
                    gender: response.data.user.gender
                }
                dispatch(setAuthUser(updatedUser))
                navigate(`/profile/${user._id}`)
                toast.success(response.data.message)
            }

           
        }
        catch (error) {
            toast.error(error.response.data.message)
        }
        finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen w-full pt-20 pb-16 px-4 md:px-10 flex justify-center">
            <div className="w-full max-w-3xl flex flex-col gap-6 ">
                {/* Header */}
                <h1 className="text-2xl font-semibold text-center md:text-left">Edit Profile</h1>

                {/* Profile Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-purple-200  rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Avatar className="h-14 w-14">
                            <AvatarImage
                                src={preview || "https://github.com/shadcn.png"}
                                className="object-cover w-full h-full"
                            />

                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col gap-1'> <span className="font-semibold md:text-lg ">{user?.username}</span>
                            <span className="font-sm text-gray-700">{user?.bio || "bio here ..."}</span></div>

                    </div>

                    {/* Change Photo */}
                    <div className="w-full md:w-auto flex justify-end">
                        <input type="file" onChange={fileHandler} className="hidden" ref={imageRef} />
                        <Button
                            onClick={() => imageRef.current.click()}
                            variant="secondary"
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition"
                        >
                            Change Photo
                        </Button>
                    </div>
                </div>


                {/* You can add form fields for bio, name, etc., below this */}
                <h1 className="text-2xl font-semibold text-center md:text-left">Bio</h1>
                <Textarea
                    placeholder="Write your bio here..."
                    value={inputData.bio}
                    onChange={(e) => setInputData({ ...inputData, bio: e.target.value })}
                    className="resize-none bg-purple-200 focus-visible:ring-0 focus:outline-none placeholder:text-gray-500 text-sm p-3 rounded-md shadow-sm"
                    rows={4}
                />
                <h1 className="text-2xl font-semibold text-center md:text-left">Gender</h1>
                <Select value={inputData.gender} onValueChange={selectChangeHandler}>
                    <SelectTrigger className="w-[180px] bg-purple-200 focus-visible:ring-transparent sm:mx-0 mx-auto">
                        <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>

                    <SelectContent className="bg-purple-200" >
                        <SelectGroup>
                            <SelectLabel>Gender</SelectLabel>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <div className='flex justify-center items-center md:justify-end'>

                    {loading ? (<Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition w-fit my-3 md:my-0 ">
                        <Loader2 className="animate-spin" />Please Wait
                    </Button>) : (<Button onClick={editProfileHandler} className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition w-fit my-3 md:my-0 ">
                        Save Changes
                    </Button>)


                    }

                </div>
            </div>
        </div>
    );
};

export default EditProfile;
