'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ImportUsersPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [results, setResults] = useState<{ imported: number; failed: number; errors: string[] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please select a valid CSV or Excel file')
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/auth/import-users', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Successfully imported ${data.imported} users`)
        setResults(data)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || 'Import failed')
        if (data.errors) {
          setResults({ imported: 0, failed: data.errors.length, errors: data.errors })
        }
      }
    } catch (err) {
      setError('An error occurred during import')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Import Users</h1>
            <button
              onClick={() => router.push('/admin/users')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← Back to Users
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Required columns: email, fullName, roles</li>
              <li>Optional columns: employeeId, password, grade, department</li>
              <li>Roles should be comma-separated (e.g., "employee,manager")</li>
              <li>Valid roles: employee, manager, hr_admin, board_of_manager, general_director</li>
              <li>If password is not provided, a default password will be generated</li>
              <li>Employee ID should be unique if provided (e.g., "EMP001")</li>
            </ul>
            <div className="mt-3 p-2 bg-white rounded border border-blue-300">
              <p className="text-xs text-blue-900 font-mono">
                Example:<br />
                email,fullName,roles,employeeId,password,grade,department<br />
                john@example.com,John Doe,"employee,manager",EMP001,pass123,Senior,Engineering
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV or Excel File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}

            {results && (
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Import Results:</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-green-600">✓ Successfully imported: {results.imported}</p>
                  <p className="text-red-600">✗ Failed: {results.failed}</p>
                  {results.errors && results.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-gray-700 mb-1">Errors:</p>
                      <ul className="list-disc list-inside text-red-600 space-y-1">
                        {results.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!file || isLoading}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Importing...' : 'Import Users'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/users')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}