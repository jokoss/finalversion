const { executeGovernmentContractsMigration } = require('./execute-government-contracts-migration');
const { seedGovernmentContracts } = require('./seed-government-contracts');

async function executeAndSeedGovernmentContracts() {
  try {
    console.log('🚀 Starting Government Contracts setup...');
    
    // First, execute the migration
    await executeGovernmentContractsMigration();
    
    // Then, seed the data
    await seedGovernmentContracts();
    
    console.log('✅ Government Contracts setup completed successfully');
    
  } catch (error) {
    console.error('❌ Government Contracts setup failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  executeAndSeedGovernmentContracts()
    .then(() => {
      console.log('✅ Government Contracts setup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Government Contracts setup script failed:', error);
      process.exit(1);
    });
}

module.exports = { executeAndSeedGovernmentContracts };
