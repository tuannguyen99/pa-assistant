import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('Pr&dcv@2025', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@prdcv.com' },
    update: {},
    create: {
      email: 'admin@prdcv.com',
      fullName: 'Admin User',
      passwordHash: hashedPassword,
      roles: ['hr_admin'],
      grade: 'Senior',
      department: 'HR',
      employmentStatus: 'active',
      isActive: true,
    },
  })
  
  console.log({ user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
