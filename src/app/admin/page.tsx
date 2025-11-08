'use client'

import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Welcome to the HR Admin dashboard. This page is only accessible to users with HR Admin role.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-800 font-semibold">✅ Access Granted</p>
            <p className="text-green-700 text-sm">You have successfully accessed a role-protected admin page.</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">Create, edit, and import users</p>
                </div>
                <span className="text-indigo-600">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}