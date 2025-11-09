'use client'

import { useState, useEffect } from 'react'

interface Employee {
  id: string
  employeeId: string
  fullName: string
  email: string
  grade: string
  department: string
  jobTitle: string | null
  managerId: string | null
  manager?: {
    id: string
    fullName: string
    employeeId: string
  } | null
}

interface EmployeeAutoPopulateProps {
  onEmployeeSelected: (employee: Employee) => void
  label?: string
  required?: boolean
  className?: string
  initialEmployeeId?: string
}

export default function EmployeeAutoPopulate({
  onEmployeeSelected,
  label = 'Employee ID',
  required = false,
  className = '',
  initialEmployeeId = ''
}: EmployeeAutoPopulateProps) {
  const [employeeId, setEmployeeId] = useState(initialEmployeeId)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [employee, setEmployee] = useState<Employee | null>(null)

  const handleLookup = async (id: string) => {
    if (!id.trim()) {
      setEmployee(null)
      setError('')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(id)}`)
      
      if (response.ok) {
        const data = await response.json()
        setEmployee(data.user)
        onEmployeeSelected(data.user)
      } else if (response.status === 404) {
        setError('Employee not found')
        setEmployee(null)
      } else {
        setError('Error looking up employee')
        setEmployee(null)
      }
    } catch (err) {
      setError('Error looking up employee')
      setEmployee(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialEmployeeId) {
      handleLookup(initialEmployeeId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmployeeId])

  const handleInputChange = (value: string) => {
    setEmployeeId(value)
    if (!value.trim()) {
      setEmployee(null)
      setError('')
    }
  }

  const handleBlur = () => {
    if (employeeId.trim() && !employee) {
      handleLookup(employeeId.trim())
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={employeeId}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Enter Employee ID"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required={required}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => handleLookup(employeeId)}
          disabled={isLoading || !employeeId.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Looking up...' : 'Lookup'}
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {employee && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <h4 className="text-sm font-semibold text-green-900 mb-2">Employee Details</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-gray-600">Name:</dt>
              <dd className="font-medium text-gray-900">{employee.fullName}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Email:</dt>
              <dd className="font-medium text-gray-900">{employee.email}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Grade:</dt>
              <dd className="font-medium text-gray-900">{employee.grade}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Department:</dt>
              <dd className="font-medium text-gray-900">{employee.department}</dd>
            </div>
            {employee.jobTitle && (
              <div>
                <dt className="text-gray-600">Job Title:</dt>
                <dd className="font-medium text-gray-900">{employee.jobTitle}</dd>
              </div>
            )}
            {employee.manager && (
              <div>
                <dt className="text-gray-600">Manager:</dt>
                <dd className="font-medium text-gray-900">{employee.manager.fullName}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}
