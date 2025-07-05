import React, { use } from 'react'
import { Outlet } from 'react-router-dom'
import Feed from './Feed'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'

const Home = () => {
  useGetAllPost();
  useGetSuggestedUsers();
  return (
    <div className='flex '>
      <div className='flex-grow'>
        <Feed />
        <Outlet />
      </div>
      <div className='hidden xl:block '>
        <RightSidebar />
      </div>

    </div>
  )
}

export default Home
