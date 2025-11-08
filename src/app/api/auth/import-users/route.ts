import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()
    
    // Parse CSV (simple implementation)
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'File is empty or invalid' },
        { status: 400 }
      )
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const emailIdx = header.indexOf('email')
    const fullNameIdx = header.indexOf('fullName')
    const rolesIdx = header.indexOf('roles')
    const passwordIdx = header.indexOf('password')
    const gradeIdx = header.indexOf('grade')
    const departmentIdx = header.indexOf('department')

    if (emailIdx === -1 || fullNameIdx === -1 || rolesIdx === -1) {
      return NextResponse.json(
        { error: 'Missing required columns: email, fullName, roles' },
        { status: 400 }
      )
    }

    const results = { imported: 0, failed: 0, errors: [] as string[] }

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
        
        const email = row[emailIdx]
        const fullName = row[fullNameIdx]
        const rolesStr = row[rolesIdx]
        const password = passwordIdx !== -1 ? row[passwordIdx] : 'defaultPass123'
        const grade = gradeIdx !== -1 ? row[gradeIdx] : 'TBD'
        const department = departmentIdx !== -1 ? row[departmentIdx] : 'TBD'

        // Parse roles (comma-separated in the cell)
        const roles = rolesStr.split(/[;|]/).map(r => r.trim()).filter(r => r)

        if (!email || !fullName || roles.length === 0) {
          results.errors.push(`Row ${i + 1}: Missing required fields`)
          results.failed++
          continue
        }

        // Create user
        await AuthService.createUser({
          email,
          fullName,
          roles,
          password,
          grade,
          department
        })

        results.imported++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Row ${i + 1}: ${errorMsg}`)
        results.failed++
      }
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}