const models = require('../models');

// Sample certifications data
const certifications = [
  {
    name: 'ISO 9001:2015',
    description: 'Quality Management Systems - Requirements',
    issuingBody: 'International Organization for Standardization',
    issueDate: new Date('2020-01-15'),
    expiryDate: new Date('2023-01-15'),
    certificateNumber: 'ISO-9001-2020-001',
    isActive: true
  },
  {
    name: 'ISO 17025:2017',
    description: 'General requirements for the competence of testing and calibration laboratories',
    issuingBody: 'International Organization for Standardization',
    issueDate: new Date('2019-06-20'),
    expiryDate: new Date('2022-06-20'),
    certificateNumber: 'ISO-17025-2019-002',
    isActive: true
  },
  {
    name: 'CLIA Certification',
    description: 'Clinical Laboratory Improvement Amendments',
    issuingBody: 'Centers for Medicare & Medicaid Services',
    issueDate: new Date('2021-03-10'),
    expiryDate: new Date('2024-03-10'),
    certificateNumber: 'CLIA-2021-003',
    isActive: true
  },
  {
    name: 'CAP Accreditation',
    description: 'College of American Pathologists Laboratory Accreditation',
    issuingBody: 'College of American Pathologists',
    issueDate: new Date('2020-09-15'),
    expiryDate: new Date('2023-09-15'),
    certificateNumber: 'CAP-2020-004',
    isActive: true
  },
  {
    name: 'EPA Certification',
    description: 'Environmental Protection Agency Laboratory Certification',
    issuingBody: 'Environmental Protection Agency',
    issueDate: new Date('2021-01-25'),
    expiryDate: new Date('2024-01-25'),
    certificateNumber: 'EPA-2021-005',
    isActive: true
  }
];

// Function to seed certifications
const seedCertifications = async () => {
  try {
    console.log('Starting certifications seeding...');
    
    // Check if certifications already exist
    const count = await models.Certification.count();
    
    if (count > 0) {
      console.log(`Certifications table already has ${count} records. Skipping seed.`);
      return;
    }
    
    // Create certifications
    await models.Certification.bulkCreate(certifications);
    
    console.log(`Successfully seeded ${certifications.length} certifications!`);
  } catch (error) {
    console.error('Error seeding certifications:', error);
  }
};

// Execute the seed function if this script is run directly
if (require.main === module) {
  seedCertifications()
    .then(() => {
      console.log('Certifications seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Certifications seeding failed:', error);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = seedCertifications;
}
