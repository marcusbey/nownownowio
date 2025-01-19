import { logger } from '../src/lib/logger';
import { execSync } from 'child_process';
import chalk from 'chalk';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: any;
}

async function runTest(name: string, command: string): Promise<TestResult> {
  const start = Date.now();
  try {
    execSync(command, { stdio: 'inherit' });
    return {
      name,
      success: true,
      duration: Date.now() - start
    };
  } catch (error) {
    return {
      name,
      success: false,
      duration: Date.now() - start,
      error
    };
  }
}

async function main() {
  logger.info(chalk.blue.bold("🚀 Starting All Tests"));
  console.log(chalk.blue("=".repeat(50)));

  const tests = [
    {
      name: "Authentication Tests",
      command: "tsx scripts/test-auth.ts"
    },
    {
      name: "Authentication Performance Tests",
      command: "tsx scripts/test-auth-perf.ts"
    },
    {
      name: "Posts and Interactions Tests",
      command: "tsx scripts/test-posts.ts"
    },
    {
      name: "Profile and Settings Tests",
      command: "tsx scripts/test-profile.ts"
    }
  ];

  const results: TestResult[] = [];
  let allPassed = true;

  for (const test of tests) {
    console.log(chalk.yellow(`\n📋 Running ${test.name}...`));
    const result = await runTest(test.name, test.command);
    results.push(result);
    
    if (!result.success) {
      allPassed = false;
    }

    console.log(chalk.gray("─".repeat(50)));
  }

  // Print Summary
  console.log(chalk.blue.bold("\n📊 Test Summary:"));
  console.log(chalk.blue("=".repeat(50)));

  results.forEach(result => {
    const status = result.success 
      ? chalk.green("✅ PASSED")
      : chalk.red("❌ FAILED");
    
    console.log(`${status} ${result.name}`);
    console.log(chalk.gray(`   Duration: ${result.duration}ms`));
    
    if (!result.success && result.error) {
      console.log(chalk.red(`   Error: ${result.error.message || 'Unknown error'}`));
    }
  });

  console.log(chalk.blue("=".repeat(50)));
  
  if (allPassed) {
    console.log(chalk.green.bold("\n✨ All tests passed successfully!"));
  } else {
    console.log(chalk.red.bold("\n❌ Some tests failed. Check the summary above for details."));
    process.exit(1);
  }
}

main().catch(error => {
  logger.error("Error running tests:", error);
  process.exit(1);
});
