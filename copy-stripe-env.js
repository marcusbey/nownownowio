/**
 * Script to copy Stripe environment variables from .env.stripe to .env
 * Run with: node copy-stripe-env.js
 */

const fs = require('fs');
const path = require('path');

// Paths to the environment files
const stripeEnvPath = path.join(__dirname, '.env.stripe');
const envPath = path.join(__dirname, '.env');

// Check if .env.stripe exists
if (!fs.existsSync(stripeEnvPath)) {
  console.error('❌ Error: .env.stripe file not found.');
  process.exit(1);
}

// Read .env.stripe file
console.log('📖 Reading .env.stripe file...');
const stripeEnvContent = fs.readFileSync(stripeEnvPath, 'utf8');

// Parse stripe environment variables
const stripeVars = {};
stripeEnvContent.split('\n').forEach(line => {
  // Skip comments and empty lines
  if (!line || line.trim().startsWith('#')) return;
  
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    
    stripeVars[key] = value;
  }
});

// Get existing .env content or create a new one
let envContent = '';
if (fs.existsSync(envPath)) {
  console.log('📖 Reading existing .env file...');
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  console.log('🆕 Creating new .env file...');
}

// Check for existing variables in .env to avoid duplicates
const existingEnv = {};
envContent.split('\n').forEach(line => {
  if (!line || line.trim().startsWith('#')) return;
  
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    existingEnv[match[1]] = true;
  }
});

// Add stripe variables to .env content if they don't already exist
console.log('🔄 Adding Stripe variables to .env...');
let additions = 0;

// First check if we already have a Stripe section
let hasStripeSection = envContent.includes('# Stripe');
if (!hasStripeSection) {
  envContent += '\n\n# Stripe\n';
}

// Add each variable if it doesn't exist
Object.entries(stripeVars).forEach(([key, value]) => {
  if (!existingEnv[key]) {
    envContent += `${key}=${value}\n`;
    additions++;
  }
});

// Write updated content to .env
fs.writeFileSync(envPath, envContent);

console.log(`✅ Done! Added ${additions} Stripe variables to .env file.`);
console.log('🔑 Your application should now be able to access the Stripe variables.'); 