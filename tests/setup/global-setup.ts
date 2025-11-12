import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

const testDbPath = path.join(process.cwd(), 'prisma', 'test.db')

async function globalSetup() {
  console.log('🔧 Setting up test database...')

  try {
    // Remove existing test database if it exists
    if (existsSync(testDbPath)) {
      console.log('🗑️ Removing existing test database...')
      execSync(`rm "${testDbPath}"`, { stdio: 'inherit' })
    }

    // Skip Prisma client generation - it should already be generated
    console.log('⏭️ Skipping Prisma client generation (already done)...')

    // Run migrations on test database
    console.log('🗃️ Running database migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })

    // Seed test database
    console.log('🌱 Seeding test database...')
    execSync('npx tsx prisma/seed-test.ts', { stdio: 'inherit' })

    console.log('✅ Test database setup complete!')
  } catch (error) {
    console.error('❌ Failed to setup test database:', error)
    throw error
  }
}

export default globalSetup