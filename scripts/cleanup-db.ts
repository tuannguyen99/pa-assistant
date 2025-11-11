import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...')

  try {
    // Get the HR Admin user (keep this)
    const hrAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@prdcv.com' // Use the known HR admin email from seed
      }
    })

    if (!hrAdmin) {
      console.log('❌ No HR Admin user found. Creating default HR Admin...')
      // Create default HR Admin if none exists
      const bcrypt = await import('bcrypt')
      const hashedPassword = await bcrypt.hash('Pr&dcv@2025', 10)

      const newHrAdmin = await prisma.user.create({
        data: {
          email: 'admin@prdcv.com',
          fullName: 'HR Admin',
          passwordHash: hashedPassword,
          roles: JSON.stringify(['hr_admin']),
          grade: 'Senior',
          department: 'HR',
          employmentStatus: 'active',
          isActive: true,
        },
      })

      console.log('✅ Created default HR Admin:', newHrAdmin.email)
      return
    }

    console.log('✅ Found HR Admin:', hrAdmin.email)

    // Delete in correct order to avoid foreign key constraints
    // Delete audit entries first (references users)
    const deletedAuditEntries = await prisma.auditEntry.deleteMany({
      where: {
        actorId: {
          not: hrAdmin.id
        }
      }
    })
    console.log(`🗑️ Deleted ${deletedAuditEntries.count} audit entries`)

    // Delete role assignments (references users)
    const deletedRoleAssignments = await prisma.roleAssignment.deleteMany({
      where: {
        OR: [
          { reviewerId: { not: hrAdmin.id } },
          { revieweeId: { not: hrAdmin.id } }
        ]
      }
    })
    console.log(`🗑️ Deleted ${deletedRoleAssignments.count} role assignments`)

    // Delete reviews (references users)
    const deletedReviews = await prisma.review.deleteMany({
      where: {
        OR: [
          { revieweeId: { not: hrAdmin.id } },
          { reviewerId: { not: hrAdmin.id } }
        ]
      }
    })
    console.log(`🗑️ Deleted ${deletedReviews.count} reviews`)

    // Delete target settings (references users)
    const deletedTargets = await prisma.targetSetting.deleteMany({
      where: {
        OR: [
          { employeeId: { not: hrAdmin.id } },
          { managerId: { not: hrAdmin.id } }
        ]
      }
    })
    console.log(`🗑️ Deleted ${deletedTargets.count} target settings`)

    // Finally delete all other users (except HR Admin)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          not: hrAdmin.id
        }
      }
    })
    console.log(`🗑️ Deleted ${deletedUsers.count} users`)

    // Keep other tables (FiscalYear, Department, EmployeeType, ScoreMapping, CompanyGoal, AIConfig)
    // as they don't reference users and contain system configuration

    console.log('✅ Database cleanup completed!')
    console.log('📋 Remaining data:')
    console.log(`   - HR Admin: ${hrAdmin.email}`)
    console.log('   - System configuration tables preserved')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('🎉 Cleanup script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Cleanup script failed:', error)
    process.exit(1)
  })