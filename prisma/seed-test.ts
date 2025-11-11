import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test database...')

  // Create test HR Admin
  const hrAdminHash = await bcrypt.hash('HRAdmin@123', 10)
  const hrAdmin = await prisma.user.upsert({
    where: { email: 'hradmin.target@example.com' },
    update: {},
    create: {
      email: 'hradmin.target@example.com',
      fullName: 'Test HR Admin',
      passwordHash: hrAdminHash,
      roles: JSON.stringify(['hr_admin', 'employee']),
      grade: 'Senior',
      department: 'HR',
      employeeId: 'HR001',
      employmentStatus: 'active',
    },
  })

  // Create test Manager
  const managerHash = await bcrypt.hash('Manager@123', 10)
  const manager = await prisma.user.upsert({
    where: { email: 'manager.target@example.com' },
    update: {},
    create: {
      email: 'manager.target@example.com',
      fullName: 'Test Manager',
      passwordHash: managerHash,
      roles: JSON.stringify(['manager', 'employee']),
      grade: 'Senior',
      department: 'Engineering',
      employeeId: 'MGR001',
      employmentStatus: 'active',
    },
  })

  // Create test Employee
  const employeeHash = await bcrypt.hash('Employee@123', 10)
  const employee = await prisma.user.upsert({
    where: { email: 'employee.target@example.com' },
    update: {},
    create: {
      email: 'employee.target@example.com',
      fullName: 'Test Employee',
      passwordHash: employeeHash,
      roles: JSON.stringify(['employee']),
      grade: 'Junior',
      department: 'Engineering',
      employeeId: 'EMP001',
      managerId: manager.id,
      employmentStatus: 'active',
    },
  })

  console.log('✅ Test users created:')
  console.log(`   - HR Admin: ${hrAdmin.email}`)
  console.log(`   - Manager: ${manager.email}`)
  console.log(`   - Employee: ${employee.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })