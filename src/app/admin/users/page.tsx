'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Users, UserCheck, Building } from 'lucide-react'

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
  employeeId: z.string().min(1, 'Employee ID is required')
})

const editUserFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  grade: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().optional()
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
}

interface RawUser {
  id: string
  email: string
  fullName: string
  roles: string | string[] | unknown
  grade?: string
  department?: string
  employeeId?: string
}

export default function UserManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  const createForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      roles: [],
      grade: '',
      department: '',
      employeeId: ''
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
      password: ''
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
  }, [users, searchTerm, departmentFilter])

  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)))

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
        body: JSON.stringify(data)
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
      employeeId: '',
      password: ''
    })
    setShowEditDialog(true)
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
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <div className="sm:w-64">
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
              A list of all users in the system with their roles and information.
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
                    <TableHead>Roles</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.employeeId || '-'}
                      </TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
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
                            <DropdownMenuItem className="text-red-600">
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
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
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