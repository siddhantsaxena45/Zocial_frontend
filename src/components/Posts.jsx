import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'
const Posts = () => {
  const {posts}=useSelector(state=>state.post)
  return (
    <>
    {  posts.map((post)=><Post key={post._id} post={post}/>)}
    </>
  )
}

export default Posts
