import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

interface EmployeeInfo {
  employeeId: string
  fullName: string
  grade: string
  department: string
  manager: {
    fullName: string
    employeeId: string
  } | null
  status: string
}

interface EmployeeInformationSectionProps {
  onEmployeeInfoLoaded?: (info: EmployeeInfo) => void
  currentUser?: {
    employeeId: string | null
    fullName: string
    grade: string | null
    department: string | null
    manager: {
      fullName: string
      employeeId: string
    } | null
  }
}

export function EmployeeInformationSection({
  onEmployeeInfoLoaded,
  currentUser,
}: EmployeeInformationSectionProps) {
  const [employeeId, setEmployeeId] = useState(currentUser?.employeeId || "")
  const [employeeInfo, setEmployeeInfo] = useState<Partial<EmployeeInfo>>({
    employeeId: currentUser?.employeeId || "",
    fullName: currentUser?.fullName || "",
    grade: currentUser?.grade || "",
    department: currentUser?.department || "",
    manager: currentUser?.manager || null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(!!currentUser?.employeeId)

  // Auto-verify and populate when currentUser is provided
  useEffect(() => {
    if (currentUser?.employeeId) {
      setEmployeeId(currentUser.employeeId)
      setEmployeeInfo({
        employeeId: currentUser.employeeId,
        fullName: currentUser.fullName || "",
        grade: currentUser.grade || "",
        department: currentUser.department || "",
        manager: currentUser.manager || null,
      })
      setVerified(true)
      setError(null)
      
      if (onEmployeeInfoLoaded) {
        onEmployeeInfoLoaded({
          employeeId: currentUser.employeeId,
          fullName: currentUser.fullName || "",
          grade: currentUser.grade || "",
          department: currentUser.department || "",
          manager: currentUser.manager || null,
          status: "Active",
        })
      }
    }
  }, [currentUser, onEmployeeInfoLoaded])

  const verifyEmployeeId = async (id: string) => {
    if (!id.trim()) {
      setError(null)
      setVerified(false)
      setEmployeeInfo({})
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/employees/verify?employeeId=${encodeURIComponent(id)}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError(`Employee ID "${id}" not found. Please verify and try again.`)
        } else {
          setError("Failed to verify employee ID")
        }
        setVerified(false)
        setEmployeeInfo({})
      } else {
        const data = await response.json()
        setEmployeeInfo(data)
        setVerified(true)
        setError(null)
        
        if (onEmployeeInfoLoaded) {
          onEmployeeInfoLoaded(data)
        }
      }
    } catch (err) {
      setError("An error occurred while verifying employee ID")
      setVerified(false)
      setEmployeeInfo({})
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmployeeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmployeeId(value)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (employeeId.trim()) {
        verifyEmployeeId(employeeId)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [employeeId])

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">Employee Information</CardTitle>
        <CardDescription>
          {currentUser 
            ? "Your employee details are automatically populated from your account"
            : "Your employee details are auto-populated when you verify your Employee ID"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Employee ID Verification - Only show if not current user */}
        {!currentUser && (
          <div>
            <Label htmlFor="employeeId" className="text-gray-700 font-medium mb-2 block">
              Employee ID *
            </Label>
            <div className="relative">
              <Input
                id="employeeId"
                value={employeeId}
                onChange={handleEmployeeIdChange}
                placeholder="Enter your Employee ID (e.g., EMP12345)"
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 pr-10"
                disabled={isLoading}
              />
              {isLoading && (
                <Loader className="absolute right-3 top-2.5 h-5 w-5 text-blue-500 animate-spin" />
              )}
              {verified && !error && (
                <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
              )}
              {error && (
                <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
              )}
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {verified && !error && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Employee ID verified successfully
              </p>
            )}
          </div>
        )}

        {/* Auto-filled Employee Information Grid */}
        {verified && employeeInfo && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
            {/* Employee ID */}
            <div>
              <Label className="text-gray-700 font-medium mb-2 block text-sm">
                Employee ID
              </Label>
              <Input
                value={employeeInfo.employeeId || ""}
                readOnly
                className="bg-white border-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Employee Name */}
            <div>
              <Label className="text-gray-700 font-medium mb-2 block text-sm">
                Employee Name
              </Label>
              <Input
                value={employeeInfo.fullName || ""}
                readOnly
                className="bg-white border-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Current Grade */}
            <div>
              <Label className="text-gray-700 font-medium mb-2 block text-sm">
                Current Grade
              </Label>
              <Input
                value={employeeInfo.grade || ""}
                readOnly
                className="bg-white border-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Department */}
            <div>
              <Label className="text-gray-700 font-medium mb-2 block text-sm">
                Department
              </Label>
              <Input
                value={employeeInfo.department || ""}
                readOnly
                className="bg-white border-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Manager */}
            <div>
              <Label className="text-gray-700 font-medium mb-2 block text-sm">
                Manager
              </Label>
              <Input
                value={employeeInfo.manager?.fullName || "-"}
                readOnly
                className="bg-white border-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Manager Employee ID */}
            <div>
              <Label className="text-gray-700 font-medium mb-2 block text-sm">
                Manager ID
              </Label>
              <Input
                value={employeeInfo.manager?.employeeId || "-"}
                readOnly
                className="bg-white border-gray-300 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Loading State Message */}
        {isLoading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">Verifying employee ID...</span>
          </div>
        )}

        {/* Empty State Message */}
        {!verified && !isLoading && !employeeId && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              Enter your Employee ID above to auto-fill your information
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
