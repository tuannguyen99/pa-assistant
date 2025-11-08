'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    roles: [] as string[],
    grade: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      // Fetch full user data
      fetch('/api/auth/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setProfileData({
              fullName: data.user.fullName || '',
              email: data.user.email || '',
              roles: data.user.roles || [],
              grade: data.user.grade || '',
              department: data.user.department || ''
            })
          }
        })
        .catch(err => {
          console.error('Failed to fetch profile:', err)
          setError('Failed to load profile')
        })
        .finally(() => setIsLoading(false))
    }
  }, [session])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your profile is read-only. Contact your HR Admin to update your information.
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-md">{profileData.fullName || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-md">{profileData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roles
              </label>
              <div className="p-2 bg-gray-50 rounded-md">
                {profileData.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.roles.map((role: string) => (
                      <span 
                        key={role}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No roles assigned</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-md">{profileData.grade || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-md">{profileData.department || 'Not set'}</p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}