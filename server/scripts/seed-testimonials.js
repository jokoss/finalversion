const { sequelize, Testimonial } = require('../models');

// Sample testimonials data
const testimonials = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Research Director',
    company: 'BioTech Solutions',
    quote: 'Outstanding precision and reliability in every test result. The team\'s expertise has been invaluable to our research projects.',
    avatar: 'SJ',
    displayOrder: 1,
    isActive: true
  },
  {
    name: 'Michael Chen',
    role: 'Quality Manager',
    company: 'PharmaCorp',
    quote: 'Fast turnaround times without compromising on quality. Their analytical services have consistently exceeded our expectations.',
    avatar: 'MC',
    displayOrder: 2,
    isActive: true
  },
  {
    name: 'Dr. Emily Rodriguez',
    role: 'Lab Director',
    company: 'Environmental Labs',
    quote: 'Their expertise in environmental testing has been crucial for our compliance requirements. Highly recommended for their attention to detail.',
    avatar: 'ER',
    displayOrder: 3,
    isActive: true
  },
  {
    name: 'James Wilson',
    role: 'CEO',
    company: 'MedTech Innovations',
    quote: 'We\'ve partnered with this lab for over five years and have always received exceptional service and accurate results.',
    avatar: 'JW',
    displayOrder: 4,
    isActive: true
  },
  {
    name: 'Dr. Priya Patel',
    role: 'Research Scientist',
    company: 'Global Research Institute',
    quote: 'The analytical capabilities of this laboratory are truly impressive. Their team has helped us advance our research significantly.',
    avatar: 'PP',
    displayOrder: 5,
    isActive: true
  }
];

// Function to seed testimonials
const seedTestimonials = async () => {
  try {
    console.log('Starting testimonials seeding...');
    
    // Check if testimonials already exist
    const result = await Testimonial.findAll();
    const count = result.length;
    
    if (count > 0) {
      console.log(`Testimonials table already has ${count} records. Skipping seed.`);
      return;
    }
    
    // Create testimonials
    await Testimonial.bulkCreate(testimonials);
    
    console.log(`Successfully seeded ${testimonials.length} testimonials!`);
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    throw error;
  }
};

// Execute the seed function if this script is run directly
if (require.main === module) {
  seedTestimonials()
    .then(() => {
      console.log('Testimonials seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Testimonials seeding failed:', error);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = seedTestimonials;
}
