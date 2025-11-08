import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

describe('Database Schema Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } }
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create a user with all required fields', async () => {
    const hashedPassword = await bcrypt.hash('testpass123', 10)
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        fullName: 'Test User',
        passwordHash: hashedPassword,
        roles: JSON.stringify(['employee']),
        grade: 'Junior',
        department: 'Engineering',
        employmentStatus: 'active',
      }
    })

    expect(user.id).toBeTruthy()
    expect(user.email).toBe('test@example.com')
    expect(user.fullName).toBe('Test User')
  })

  it('should verify password hashing works', async () => {
    const password = 'mypassword'
    const hashedPassword = await bcrypt.hash(password, 10)
    const isMatch = await bcrypt.compare(password, hashedPassword)
    
    expect(isMatch).toBe(true)
  })
})
