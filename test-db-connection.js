const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test connection by executing a simple SQL query
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1;`;
    console.log('Successfully connected to database!');
    
    // Try to count users (optional, might fail if users table doesn't exist)
    try {
      const userCount = await prisma.user.count();
      console.log(`Found ${userCount} users in the database.`);
    } catch (userError) {
      console.log('Could not query users table. This might be normal if no users exist or the table is not yet created.');
    }
    
    // Close the connection
    await prisma.$disconnect();
    console.log('Database connection closed successfully.');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

testConnection();