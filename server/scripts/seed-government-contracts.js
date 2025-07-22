const { sequelize } = require('../models');

async function seedGovernmentContracts() {
  try {
    console.log('🚀 Starting Government Contracts seeding...');
    
    // Initialize the GovernmentContract model properly
    const GovernmentContractFactory = require('../models/GovernmentContract');
    const GovernmentContract = GovernmentContractFactory(sequelize);
    
    // Check if contracts already exist
    const existingCount = await GovernmentContract.count();
    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing government contracts. Skipping seeding.`);
      return;
    }
    
    // Sample government contracts data
    const contractsData = [
      {
        agency_name: 'Ministry of Health',
        description: 'Comprehensive laboratory testing services for public health initiatives including water quality testing, food safety analysis, and environmental monitoring.',
        logo_url: '/images/contracts/ministry-health.png',
        is_active: true,
        display_order: 1
      },
      {
        agency_name: 'Environmental Protection Agency',
        description: 'Specialized environmental testing services for air quality monitoring, soil contamination assessment, and industrial waste analysis.',
        logo_url: '/images/contracts/epa.png',
        is_active: true,
        display_order: 2
      },
      {
        agency_name: 'Department of Agriculture',
        description: 'Agricultural product testing and quality assurance services including pesticide residue analysis, nutritional content testing, and food safety certification.',
        logo_url: '/images/contracts/agriculture.png',
        is_active: true,
        display_order: 3
      },
      {
        agency_name: 'Municipal Water Authority',
        description: 'Regular water quality testing and monitoring services for municipal water supply systems, ensuring compliance with health and safety standards.',
        logo_url: '/images/contracts/water-authority.png',
        is_active: true,
        display_order: 4
      },
      {
        agency_name: 'Department of Education',
        description: 'School facility safety testing including air quality assessment, water testing, and environmental hazard identification for educational institutions.',
        logo_url: '/images/contracts/education.png',
        is_active: true,
        display_order: 5
      }
    ];
    
    // Create government contracts
    const createdContracts = await GovernmentContract.bulkCreate(contractsData);
    
    console.log(`✅ Successfully created ${createdContracts.length} government contracts:`);
    createdContracts.forEach(contract => {
      console.log(`   - ${contract.agency_name}`);
    });
    
    return createdContracts;
    
  } catch (error) {
    console.error('❌ Government Contracts seeding failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedGovernmentContracts()
    .then(() => {
      console.log('✅ Government Contracts seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Government Contracts seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedGovernmentContracts };
