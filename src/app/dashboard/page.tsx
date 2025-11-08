'use client'

import { useSession, signOut } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="min-h-screen p-8">Loading...</div>
  }

  if (!session) {
    return <div className="min-h-screen p-8">Access denied. Please log in.</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Performance Assessment Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome, {session.user?.email}</h2>
          <p className="text-gray-600 mb-4">
            This is your performance assessment dashboard. The full application features will be implemented in upcoming stories.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Target Setting</h3>
              <p className="text-blue-600 text-sm">Set performance targets for the year</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Reviews</h3>
              <p className="text-green-600 text-sm">Conduct performance reviews</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Analytics</h3>
              <p className="text-purple-600 text-sm">View performance analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
