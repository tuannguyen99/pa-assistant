import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'

export async function GET(request: NextRequest) {
  try {
    // Check if current user is HR Admin
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isHRAdmin = await AuthService.isHRAdmin(currentUser.id)
    if (!isHRAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - HR Admin access required' },
        { status: 403 }
      )
    }

    // Get all users
    const users = await AuthService.getAllUsers()

    // Remove password hashes from response
    const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user)

    return NextResponse.json({ users: usersWithoutPasswords }, { status: 200 })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}