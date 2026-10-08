import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from '../Shared/Navbar'

import AOS from 'aos'
import 'aos/dist/aos.css'
import { useEffect } from 'react'

AOS.init({
  duration: 700,
  easing: "ease-out-cubic",
  once: true,
  mirror: false,
})

export default function DashboardLayout() {
  const location = useLocation();

  useEffect(() => {
    AOS.refresh();
  }, [location.pathname]);

  return (
    <>
      <div className="grid grid-cols-[300px_1fr] h-screen w-full bg-[#F8FAFC]">
        <Sidebar />

        <div className="flex flex-col overflow-y-auto!">
          <Navbar />
          <main className="w-full px-6 pt-6 pb-10">
            <Outlet />
          </main>
        </div>
      </div>
      {/* <div className="grid grid-cols-[300px_1fr]! min-h-screen bg-[#F9FAFB80]">
            
      <Sidebar />
      
      <div className="flex flex-col">
        <Navbar />

        <main className="flex-1 w-full p-0">
          <Outlet />
        </main>
      </div>

    </div> */}
    </>

  )
}