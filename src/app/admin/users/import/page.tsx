'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Papa from 'papaparse'

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; email: string; error: string }>
}

interface EmployeeRow {
  employeeId: string
  fullName: string
  email: string
  grade: string
  department: string
  jobTitle?: string
  employmentStatus?: string
  managerId?: string
  roles?: string
}

export default function EmployeeImportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<EmployeeRow[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setResult(null)
    setPreviewData([])
    setShowPreview(false)

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    // Parse CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message)
          return
        }

        const data = results.data as EmployeeRow[]
        
        // Validate required columns
        if (data.length === 0) {
          setError('CSV file is empty')
          return
        }

        const firstRow = data[0]
        const requiredColumns = ['employeeId', 'fullName', 'email', 'grade', 'department']
        const missingColumns = requiredColumns.filter(col => !(col in firstRow))
        
        if (missingColumns.length > 0) {
          setError(`Missing required columns: ${missingColumns.join(', ')}`)
          return
        }

        setPreviewData(data)
        setShowPreview(true)
      },
      error: (error) => {
        setError('Error reading file: ' + error.message)
      }
    })
  }

  const handleImport = async () => {
    if (previewData.length === 0) {
      setError('No data to import')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Process roles field - convert comma-separated string to array
      const processedData = previewData.map(row => ({
        ...row,
        roles: row.roles ? row.roles.split(',').map(r => r.trim()) : undefined,
        employmentStatus: row.employmentStatus || 'active'
      }))

      const response = await fetch('/api/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: processedData })
      })

      const data = await response.json()
      
      if (response.ok || response.status === 207) {
        setResult(data)
        if (data.success) {
          // Clear the form after successful import
          setPreviewData([])
          setShowPreview(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      } else {
        setError(data.error || 'Import failed')
      }
    } catch (err) {
      setError('An error occurred during import')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = [
      'employeeId,fullName,email,grade,department,jobTitle,employmentStatus,managerId,roles',
      'EMP001,John Doe,john.doe@example.com,Senior,Engineering,Senior Engineer,active,,employee',
      'EMP002,Jane Smith,jane.smith@example.com,Principal,Engineering,Principal Engineer,active,,employee,manager'
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

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
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Import Employees</h1>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Back to Users
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Import Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Download the CSV template below to see the required format</li>
                <li>Required columns: employeeId, fullName, email, grade, department</li>
                <li>Optional columns: jobTitle, employmentStatus (active/inactive/on_leave), managerId, roles</li>
                <li>For roles, use comma-separated values (e.g., "employee,manager")</li>
                <li>Default password will be set to the employeeId</li>
              </ul>
              <button
                onClick={downloadTemplate}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 text-sm"
              >
                Download CSV Template
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                Select CSV File
              </label>
              <p className="mt-2 text-sm text-gray-500">
                Upload a CSV file with employee data
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className={`mb-4 p-4 rounded-md border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                result.success ? 'text-green-900' : 'text-yellow-900'
              }`}>
                Import Results
              </h3>
              <p className={`text-sm ${
                result.success ? 'text-green-800' : 'text-yellow-800'
              }`}>
                Successfully imported: {result.imported} employees
                {result.failed > 0 && ` | Failed: ${result.failed} employees`}
              </p>
              
              {result.errors.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-yellow-900 text-sm mb-1">Errors:</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {result.errors.map((err, idx) => (
                        <li key={idx}>
                          Row {err.row} ({err.email}): {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {result.success && (
                <button
                  onClick={() => router.push('/admin/users')}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
                >
                  View Imported Users
                </button>
              )}
            </div>
          )}

          {showPreview && previewData.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Preview ({previewData.length} employees)
              </h3>
              <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Employee ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Grade
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Department
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Job Title
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.employeeId}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.fullName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row.email}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row.grade}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row.department}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row.jobTitle || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleImport}
                  disabled={isUploading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Importing...' : 'Import Employees'}
                </button>
                <button
                  onClick={() => {
                    setPreviewData([])
                    setShowPreview(false)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  disabled={isUploading}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
