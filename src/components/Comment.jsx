import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const Comment = ({ comment }) => {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment?.author?.profilepicture} className="object-cover w-full h-full" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      {/* Text wrapper */}
      <div className="flex-1  text-sm sm:text-base leading-snug break-words overflow-hidden">
        <span className="font-semibold mr-1 text-sm">{comment?.author?.username}</span>
        <span className="break-words break-all overflow-hidden w-full">{comment?.text}</span>
      </div>
    </div>
  )
}

export default Comment
