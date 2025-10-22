import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import './Admin.css'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  useEffect(() => {
    document.body.classList.add('admin-body')
    return () => document.body.classList.remove('admin-body')
  }, [])

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}
