#!/usr/bin/env node

/**
 * This script synchronizes the database schema with the Prisma schema
 * It ensures all tables and columns defined in Prisma exist in the database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a command and return the output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Function to create a migration file
function createMigration(name, sql) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const migrationDir = path.join(__dirname, '..', 'prisma', 'migrations', `${timestamp}_${name}`);
  
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(migrationDir, 'migration.sql'), sql);
  console.log(`Created migration: ${migrationDir}/migration.sql`);
  
  return migrationDir;
}

// Function to deploy a migration
function deployMigration() {
  console.log('Deploying migration...');
  runCommand('npx prisma migrate deploy');
  console.log('Migration deployed successfully');
}

// Function to get the database schema
function getDatabaseSchema() {
  console.log('Getting database schema...');
  
  // This will vary depending on your database type
  // For PostgreSQL, you can use pg_dump to get the schema
  try {
    // Extract database URL from .env file or environment variables
    let databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
      const match = envContent.match(/DATABASE_URL="([^"]+)"/);
      if (match) {
        databaseUrl = match[1];
      } else {
        throw new Error('DATABASE_URL not found in .env file');
      }
    }
    
    // Parse the database URL to get connection details
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = url.port;
    const database = url.pathname.substring(1);
    const user = url.username;
    
    // Get the schema using pg_dump
    const schema = runCommand(`PGPASSWORD=${url.password} pg_dump -h ${host} -p ${port} -U ${user} -d ${database} --schema-only`);
    return schema;
  } catch (error) {
    console.error('Error getting database schema:');
    console.error(error.message);
    
    // Fallback: use Prisma's db pull to get the current schema
    console.log('Falling back to Prisma db pull...');
    runCommand('npx prisma db pull --print');
    return null;
  }
}

// Function to parse Prisma schema and extract models and fields
function parsePrismaSchema() {
  console.log('Parsing Prisma schema...');
  
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema');
  const schemaFiles = fs.readdirSync(schemaPath)
    .filter(file => file.endsWith('.prisma'))
    .map(file => path.join(schemaPath, file));
  
  const models = {};
  
  for (const file of schemaFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const modelMatches = content.matchAll(/model\s+(\w+)\s+{([^}]+)}/g);
    
    for (const match of modelMatches) {
      const modelName = match[1];
      const modelBody = match[2];
      
      const fields = {};
      const fieldMatches = modelBody.matchAll(/(\w+)\s+([^\s]+)(\s+[^\/\n]+)?/g);
      
      for (const fieldMatch of fieldMatches) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        const fieldAttributes = fieldMatch[3] || '';
        
        // Skip relation fields
        if (!fieldType.includes('[') && !fieldType.includes('{')) {
          fields[fieldName] = {
            type: fieldType,
            attributes: fieldAttributes.trim()
          };
        }
      }
      
      models[modelName] = fields;
    }
  }
  
  return models;
}

// Function to generate SQL to add missing columns
function generateSqlForMissingColumns(models, dbSchema) {
  console.log('Generating SQL for missing columns...');
  
  let sql = '';
  
  // For each model, check if the table exists and has all the required columns
  for (const [modelName, fields] of Object.entries(models)) {
    const tableName = modelName;
    
    // Check if table exists in the database
    const tableExists = dbSchema.includes(`CREATE TABLE "${tableName}"`);
    
    if (!tableExists) {
      console.log(`Table "${tableName}" does not exist in the database`);
      continue; // Skip this model, as we're only adding missing columns
    }
    
    // For each field, check if the column exists
    for (const [fieldName, fieldInfo] of Object.entries(fields)) {
      // Skip id fields as they should already exist
      if (fieldName === 'id') continue;
      
      // Check if column exists in the table
      const columnExists = dbSchema.includes(`"${fieldName}"`) && 
                          dbSchema.includes(`"${tableName}"."${fieldName}"`);
      
      if (!columnExists) {
        console.log(`Column "${fieldName}" does not exist in table "${tableName}"`);
        
        // Map Prisma types to SQL types
        let sqlType;
        switch (fieldInfo.type) {
          case 'String':
            sqlType = 'TEXT';
            break;
          case 'Int':
            sqlType = 'INTEGER';
            break;
          case 'Float':
            sqlType = 'DOUBLE PRECISION';
            break;
          case 'Boolean':
            sqlType = 'BOOLEAN';
            break;
          case 'DateTime':
            if (fieldInfo.attributes.includes('@db.Timestamp')) {
              sqlType = 'TIMESTAMP(6)';
            } else {
              sqlType = 'TIMESTAMP(3)';
            }
            break;
          default:
            // For enum types or other custom types
            sqlType = fieldInfo.type.toUpperCase();
        }
        
        // Generate SQL to add the column
        sql += `-- Add ${fieldName} column to ${tableName} table\n`;
        sql += `BEGIN;\n`;
        sql += `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${fieldName}" ${sqlType}`;
        
        // Add default value if specified
        if (fieldInfo.attributes.includes('@default')) {
          const defaultMatch = fieldInfo.attributes.match(/@default\(([^)]+)\)/);
          if (defaultMatch) {
            let defaultValue = defaultMatch[1];
            
            // Handle special default values
            if (defaultValue === 'now()') {
              defaultValue = 'CURRENT_TIMESTAMP';
            } else if (defaultValue === 'true' || defaultValue === 'false') {
              // Boolean defaults are already correct
            } else if (!isNaN(defaultValue)) {
              // Numeric defaults are already correct
            } else {
              // String defaults need quotes
              defaultValue = `'${defaultValue}'`;
            }
            
            sql += ` DEFAULT ${defaultValue}`;
          }
        }
        
        sql += `;\n`;
        sql += `COMMIT;\n\n`;
      }
    }
  }
  
  return sql;
}

// Main function
async function main() {
  console.log('Starting database schema synchronization...');
  
  // Get the database schema
  const dbSchema = getDatabaseSchema();
  
  // Parse the Prisma schema
  const models = parsePrismaSchema();
  
  // Generate SQL for missing columns
  const sql = generateSqlForMissingColumns(models, dbSchema);
  
  if (sql) {
    // Create a migration
    const migrationDir = createMigration('sync_db_schema', sql);
    
    // Deploy the migration
    deployMigration();
    
    console.log('Database schema synchronized successfully');
  } else {
    console.log('No missing columns found, database schema is already in sync');
  }
}

// Run the main function
main().catch(error => {
  console.error('Error synchronizing database schema:');
  console.error(error);
  process.exit(1);
});
