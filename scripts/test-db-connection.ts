import { PrismaClient } from '@prisma/client'

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('Successfully connected to database!')
    
    // Try a simple query
    const userCount = await prisma.user.count()
    console.log(`Database is working! Found ${userCount} users.`)
  } catch (error) {
    console.error('Failed to connect to database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
