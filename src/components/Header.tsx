'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const { data: session, status } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading') {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">PA System</h1>
            </div>
          </div>
        </div>
      </header>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const userRoles = session?.user?.roles || []
  const isManager = userRoles.includes('manager') || userRoles.includes('hr_admin') || userRoles.includes('general_director') || userRoles.includes('board_manager')
  const isEmployee = userRoles.includes('employee') || userRoles.length === 0

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
              PA System
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>

              {isEmployee && (
                <Link href="/targets/new" className="text-gray-700 hover:text-gray-900">
                  My Targets
                </Link>
              )}

              {isManager && (
                <Link href="/targets/pending" className="text-gray-700 hover:text-gray-900">
                  Review Targets
                </Link>
              )}

              <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                Profile
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user?.roles?.includes('hr_admin') && (
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
                Admin
              </Link>
            )}
            <span className="text-gray-700">Welcome, {session?.user?.name || session?.user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}