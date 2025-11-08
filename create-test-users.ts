import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createTestUsers() {
  const employeePassword = await bcrypt.hash('employee123', 10)

  // Create employee user
  const employee = await prisma.user.upsert({
    where: { email: 'employee@test.com' },
    update: {},
    create: {
      email: 'employee@test.com',
      fullName: 'Test Employee',
      passwordHash: employeePassword,
      roles: ['employee'],
      grade: 'T1',
      department: 'Engineering',
      employeeId: 'EMP001'
    },
  })

  console.log('Created test employee:', employee)
}

createTestUsers()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })