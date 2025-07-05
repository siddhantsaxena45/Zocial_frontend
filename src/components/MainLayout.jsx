import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <>
    <div>
      <LeftSidebar />
    </div>
    <div>
        <Outlet />
    </div>
    </>
  )
}

export default MainLayout
