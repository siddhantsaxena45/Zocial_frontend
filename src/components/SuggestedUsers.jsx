
import React from 'react'
import { useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(state => state.auth)
    return (
        <div className='mt-3 flex flex-col gap-2 w-full'>
            <div className='flex gap-3 justify-between items-center'>
                <span className='font-semibold '>Suggested Users</span>
                <span className='text-sm text-gray-700 cursor-pointer'>See All</span>
            </div>
            <div className='flex flex-col gap-2'>
                {suggestedUsers.map(user => {
                    return <div className="flex items-center gap-3 w-full" key={user._id} >
                        <div className=' flex items-center gap-3 w-full'>
                            <Link to={`/profile/${user?._id}`}>
                            <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                <AvatarImage src={user?.profilepicture || "https://github.com/shadcn.png"} className="w-full h-full object-cover" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            </Link>
                            <div className='flex flex-col justify-center items-start w-full'>
                                <span className="font-semibold text-sm truncate"><Link to={`/profile/${user?._id}`}>{user?.username}</Link> </span>
                                <span className="text-xs text-gray-700 truncate">{user?.bio || "bio here ..."}</span>
                            </div>
                        </div>
                      <Link to={`/profile/${user?._id}`}> <span className='font-semibold cursor-pointer text-blue-500 hover:text-blue-700'>Follow</span></Link> 

                    </div>
                })

                }
            </div>

        </div>
    )
}

export default SuggestedUsers
