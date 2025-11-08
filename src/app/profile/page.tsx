'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    grade: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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
            setFormData({
              fullName: data.user.fullName || '',
              email: data.user.email || '',
              grade: data.user.grade || '',
              department: data.user.department || ''
            })
          }
        })
        .catch(err => console.error('Failed to fetch profile:', err))
    }
  }, [session])

  if (status === 'loading') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        // Update session if needed
        await update()
        setIsEditing(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Update failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Edit
              </button>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              ) : (
                <p className="text-gray-900">{formData.fullName || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{formData.email}</p>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{formData.grade || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{formData.department || 'Not set'}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}