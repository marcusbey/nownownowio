// Script to run the SQL migration
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Running plan migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-plan-migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(`${statement};`);
        console.log('Statement executed successfully');
      } catch (error) {
        console.error(`Error executing statement: ${error.message}`);
        // Continue with the next statement
      }
    }
    
    console.log('Migration completed!');
    
    // Verify the changes
    console.log('\nVerifying changes...');
    
    // Check if previousPlanId column exists
    const previousPlanIdExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Organization'
        AND column_name = 'previousPlanId'
      );
    `;
    console.log(`previousPlanId column exists: ${previousPlanIdExists[0].exists}`);
    
    // Check if planChangedAt column exists
    const planChangedAtExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Organization'
        AND column_name = 'planChangedAt'
      );
    `;
    console.log(`planChangedAt column exists: ${planChangedAtExists[0].exists}`);
    
    // Check if OrganizationPlanHistory table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'OrganizationPlanHistory'
      );
    `;
    console.log(`OrganizationPlanHistory table exists: ${tableExists[0].exists}`);
    
    // List available plans
    const plans = await prisma.$queryRaw`
      SELECT id, name, type, "maximumMembers" 
      FROM "OrganizationPlan"
    `;
    console.log('\nAvailable plans:');
    console.table(plans);
    
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
