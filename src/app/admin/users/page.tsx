'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Search, Filter, MoreHorizontal, Edit, Users, UserCheck, Building, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import Header from '@/components/Header'

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee', color: 'bg-blue-100 text-blue-800' },
  { value: 'manager', label: 'Manager', color: 'bg-green-100 text-green-800' },
  { value: 'hr_admin', label: 'HR Admin', color: 'bg-purple-100 text-purple-800' },
  { value: 'board_of_manager', label: 'Board of Manager', color: 'bg-orange-100 text-orange-800' },
  { value: 'general_director', label: 'General Director', color: 'bg-red-100 text-red-800' }
]

const userFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  grade: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  managerId: z.string().nullable().optional()
})

const editUserFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  grade: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().optional(),
  managerId: z.string().nullable().optional()
})

type UserFormData = z.infer<typeof userFormSchema>
type EditUserFormData = z.infer<typeof editUserFormSchema>

interface User {
  id: string
  email: string
  fullName: string
  roles: string[]
  grade?: string
  department?: string
  employeeId?: string
  isActive: boolean
  managerId?: string
  manager?: {
    id: string
    fullName: string
  }
}

interface RawUser {
  id: string
  email: string
  fullName: string
  roles: string | string[] | unknown
  grade?: string
  department?: string
  employeeId?: string
  isActive: boolean
  managerId?: string
  manager?: {
    id: string
    fullName: string
  }
}

export default function UserManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [managers, setManagers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | 'all'>(10) // Users per page

  const createForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      roles: [],
      grade: '',
      department: '',
      employeeId: '',
      managerId: ''
    }
  })

  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      fullName: '',
      roles: [],
      grade: '',
      department: '',
      employeeId: '',
      password: '',
      managerId: ''
    }
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      const userRoles = session?.user?.roles || []
      if (!userRoles.includes('hr_admin')) {
        router.push('/dashboard')
      }
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status])

  // Filter users when search term, department filter, or users change
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.employeeId?.toLowerCase().includes(search)
      )
    }

    if (departmentFilter) {
      filtered = filtered.filter(user => user.department === departmentFilter)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [users, searchTerm, departmentFilter])

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)))

  // Pagination logic
  const actualPageSize = pageSize === 'all' ? filteredUsers.length : pageSize
  const totalPages = Math.ceil(filteredUsers.length / actualPageSize)
  const startIndex = (currentPage - 1) * actualPageSize
  const endIndex = startIndex + actualPageSize
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users')
      if (response.ok) {
        const data = await response.json()
        const usersWithParsedRoles = data.users.map((user: RawUser) => {
          let roles: string[] = []
          if (Array.isArray(user.roles)) {
            roles = user.roles
          } else if (typeof user.roles === 'string') {
            try {
              roles = JSON.parse(user.roles)
              if (!Array.isArray(roles)) {
                roles = []
              }
            } catch (e) {
              console.error('Failed to parse roles JSON for user:', user.email, e)
              roles = []
            }
          } else if (user.roles && typeof user.roles === 'string') {
            roles = [user.roles]
          }
          return { ...user, roles }
        })
        setUsers(usersWithParsedRoles)
        
        // Set managers list (users with manager role or higher)
        const potentialManagers = usersWithParsedRoles.filter((user: User) => 
          user.roles.includes('manager') || 
          user.roles.includes('hr_admin') || 
          user.roles.includes('general_director') || 
          user.roles.includes('board_manager')
        )
        setManagers(potentialManagers)
      } else {
        setError('Failed to load users')
      }
    } catch (err) {
      setError('An error occurred while loading users')
    } finally {
      setIsLoading(false)
    }
  }

  const onCreateUser = async (data: UserFormData) => {
    setError('')
    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          managerId: data.managerId || null
        })
      })

      if (response.ok) {
        setShowCreateDialog(false)
        createForm.reset()
        fetchUsers()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create user')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const onEditUser = async (data: EditUserFormData) => {
    setError('')
    if (!editingUser) return

    try {
      const updateData = {
        id: editingUser.id,
        fullName: data.fullName,
        roles: data.roles,
        grade: data.grade || '',
        department: data.department || '',
        employeeId: data.employeeId,
        managerId: data.managerId || null,
        ...(data.password && data.password.trim().length > 0 && { password: data.password })
      }

      const response = await fetch('/api/auth/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setShowEditDialog(false)
        setEditingUser(null)
        editForm.reset()
        fetchUsers()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update user')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    editForm.reset({
      fullName: user.fullName,
      roles: user.roles,
      grade: user.grade || '',
      department: user.department || '',
      employeeId: user.employeeId || '',
      password: '',
      managerId: user.managerId || ''
    })
    setShowEditDialog(true)
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user? They will not be able to log in.')) {
      return
    }
    setError('')
    try {
      const response = await fetch('/api/auth/deactivate-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      })

      if (response.ok) {
        fetchUsers()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to deactivate user')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const handleReactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to reactivate this user? They will be able to log in again.')) {
      return
    }
    setError('')
    try {
      const response = await fetch('/api/auth/reactivate-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      })

      if (response.ok) {
        fetchUsers()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to reactivate user')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userEmail}"? This action cannot be undone.`)) {
      return
    }
    setError('')
    try {
      const response = await fetch('/api/auth/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      })

      if (response.ok) {
        fetchUsers()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete user')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDepartmentFilter('')
  }

  const getRoleBadgeColor = (role: string) => {
    const roleOption = ROLE_OPTIONS.find(r => r.value === role)
    return roleOption?.color || 'bg-gray-100 text-gray-800'
  }

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

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-indigo-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage employee accounts and permissions</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/users/import')}
              className="flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Import Users
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                  <DialogDescription>
                    Add a new employee to the system with their basic information and roles.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateUser)} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="employeeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employee ID *</FormLabel>
                              <FormControl>
                                <Input placeholder="EMP001" autoComplete="off" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" autoComplete="off" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Account Credentials */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Account Credentials</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={createForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@company.com" autoComplete="off" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password *</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Minimum 6 characters" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Employment Details */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Employment Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade</FormLabel>
                              <FormControl>
                                <Input placeholder="Senior" autoComplete="off" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Input placeholder="Engineering" autoComplete="off" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={createForm.control}
                        name="managerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manager</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a manager (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No Manager</SelectItem>
                                {managers.map((manager) => (
                                  <SelectItem key={manager.id} value={manager.id}>
                                    {manager.fullName} ({manager.employeeId})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Roles */}
                    <div className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="roles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">Roles *</FormLabel>
                            <FormDescription className="text-xs">
                              Select one or more roles for this user
                            </FormDescription>
                            <div className="grid grid-cols-2 gap-3">
                              {ROLE_OPTIONS.map((role) => (
                                <div
                                  key={role.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <Checkbox
                                    checked={field.value?.includes(role.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, role.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== role.value
                                            )
                                          )
                                    }}
                                  />
                                  <Label className="font-normal text-sm">
                                    {role.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createForm.formState.isSubmitting}>
                        {createForm.formState.isSubmitting ? 'Creating...' : 'Create User'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="sm:w-32">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value="all">Show all</option>
                </select>
              </div>
              {(searchTerm || departmentFilter) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              {pageSize === 'all'
                ? `Showing all ${filteredUsers.length} users`
                : `Showing ${paginatedUsers.length} of ${filteredUsers.length} users (Page ${currentPage} of ${totalPages})`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.employeeId || '-'}
                      </TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.manager ? user.manager.fullName : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className={getRoleBadgeColor(role)}
                            >
                              {ROLE_OPTIONS.find(r => r.value === role)?.label || role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{user.grade || '-'}</TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isActive ? (
                              <DropdownMenuItem
                                className="text-orange-600"
                                onClick={() => handleDeactivateUser(user.id)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Deactivate User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleReactivateUser(user.id)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivate User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pageSize !== 'all' && totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditUser)} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Employment Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={editForm.control}
                    name="managerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a manager (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Manager</SelectItem>
                            {managers
                              .filter(manager => manager.id !== editingUser?.id) // Don't allow self-reference
                              .map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.fullName} ({manager.employeeId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Security</h4>
                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password (leave blank to keep current)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Roles */}
                <div className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">Roles *</FormLabel>
                        <FormDescription className="text-xs">
                          Select one or more roles for this user
                        </FormDescription>
                        <div className="grid grid-cols-2 gap-3">
                          {ROLE_OPTIONS.map((role) => (
                            <div
                              key={role.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <Checkbox
                                checked={field.value?.includes(role.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, role.value])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== role.value
                                        )
                                      )
                                }}
                              />
                              <Label className="font-normal text-sm">
                                {role.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editForm.formState.isSubmitting}>
                    {editForm.formState.isSubmitting ? 'Updating...' : 'Update User'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}