const { sequelize } = require('../models');
const path = require('path');
const fs = require('fs');

async function executeGovernmentContractsMigration() {
  try {
    console.log('🚀 Starting Government Contracts migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/20250722_create_government_contracts_table.js');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migration = require(migrationPath);
    
    // Execute the migration
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    
    console.log('✅ Government Contracts migration completed successfully');
    
    // Verify the table was created
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    if (tableExists.includes('government_contracts')) {
      console.log('✅ Government Contracts table verified');
    } else {
      console.log('⚠️ Government Contracts table not found after migration');
    }
    
  } catch (error) {
    console.error('❌ Government Contracts migration failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  executeGovernmentContractsMigration()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { executeGovernmentContractsMigration };
