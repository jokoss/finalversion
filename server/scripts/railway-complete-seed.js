const { Category, Test, Testimonial, GovernmentContract } = require('../models');
const sequelize = require('../config/database');

async function seedRailwayDatabase() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // First, let's check what's currently in the database
    const existingCategories = await Category.findAll();
    console.log(`📊 Found ${existingCategories.length} existing categories`);

    // Complete categories data with proper descriptions and placeholder images
    const categories = [
      {
        name: 'Biochemical Testing',
        description: 'Comprehensive analysis of biological materials for chemical properties and components including protein quantification, enzyme assays, and metabolite analysis.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
        active: true,
        displayOrder: 1
      },
      {
        name: 'Environmental Analysis',
        description: 'Detailed analysis of environmental samples including water, soil, and air quality testing for pollutants, heavy metals, and contaminants.',
        imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=300&fit=crop&crop=center',
        active: true,
        displayOrder: 2
      },
      {
        name: 'Microbiological Testing',
        description: 'Identification and analysis of microorganisms in various samples including bacterial identification, fungal analysis, and antimicrobial susceptibility testing.',
        imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop&crop=center',
        active: true,
        displayOrder: 3
      },
      {
        name: 'Molecular Diagnostics',
        description: 'Advanced DNA and RNA-based testing for research and clinical applications including PCR, sequencing, and genetic analysis.',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
        active: true,
        displayOrder: 4
      },
      {
        name: 'Material Characterization',
        description: 'Analysis of material properties and composition for research and quality control including structural analysis and surface characterization.',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop&crop=center',
        active: true,
        displayOrder: 5
      },
      {
        name: 'Pharmaceutical Analysis',
        description: 'Testing and validation of pharmaceutical products and ingredients including purity analysis, stability testing, and quality control.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
        active: true,
        displayOrder: 6
      },
      {
        name: 'Food & Beverage Testing',
        description: 'Quality and safety testing for food and beverage products including nutritional analysis, contamination testing, and shelf-life studies.',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
        active: true,
        displayOrder: 7
      },
      {
        name: 'Toxicology Screening',
        description: 'Detection and analysis of toxic substances in various sample types including drug screening, environmental toxins, and safety assessment.',
        imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop&crop=center',
        active: true,
        displayOrder: 8
      }
    ];

    console.log('🌱 Starting to seed categories...');

    // Create or update categories
    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ where: { name: categoryData.name } });
      if (!existingCategory) {
        const newCategory = await Category.create(categoryData);
        console.log(`✅ Created category: ${categoryData.name} (ID: ${newCategory.id})`);
      } else {
        // Update existing category to ensure it has proper data
        await existingCategory.update({
          description: categoryData.description,
          imageUrl: categoryData.imageUrl,
          active: true,
          displayOrder: categoryData.displayOrder
        });
        console.log(`🔄 Updated category: ${categoryData.name} (ID: ${existingCategory.id})`);
      }
    }

    // Now create comprehensive tests for each category
    console.log('🧪 Starting to seed tests...');

    // Biochemical Testing Tests
    const biochemicalCategory = await Category.findOne({ where: { name: 'Biochemical Testing' } });
    if (biochemicalCategory) {
      const biochemicalTests = [
        {
          name: 'Protein Quantification',
          description: 'Accurate measurement of protein concentration in biological samples using Bradford or BCA methods.',
          price: 95.00,
          turnaroundTime: '2-3 business days',
          methodReference: 'Bradford/BCA Assay',
          active: true,
          displayOrder: 1,
          categoryId: biochemicalCategory.id
        },
        {
          name: 'Enzyme Activity Assay',
          description: 'Determination of enzyme activity levels in various biological samples.',
          price: 120.00,
          turnaroundTime: '3-4 business days',
          methodReference: 'Spectrophotometric Analysis',
          active: true,
          displayOrder: 2,
          categoryId: biochemicalCategory.id
        },
        {
          name: 'Lipid Profile Analysis',
          description: 'Comprehensive assessment of lipid content and composition in biological samples.',
          price: 150.00,
          turnaroundTime: '3-5 business days',
          methodReference: 'GC-MS/HPLC',
          active: true,
          displayOrder: 3,
          categoryId: biochemicalCategory.id
        },
        {
          name: 'Metabolite Profiling',
          description: 'Comprehensive analysis of small molecule metabolites in biological samples.',
          price: 275.00,
          turnaroundTime: '5-7 business days',
          methodReference: 'LC-MS/MS',
          active: true,
          displayOrder: 4,
          categoryId: biochemicalCategory.id
        }
      ];

      for (const testData of biochemicalTests) {
        const existingTest = await Test.findOne({ where: { name: testData.name, categoryId: biochemicalCategory.id } });
        if (!existingTest) {
          await Test.create(testData);
          console.log(`  ✅ Created test: ${testData.name}`);
        }
      }
    }

    // Environmental Analysis Tests
    const environmentalCategory = await Category.findOne({ where: { name: 'Environmental Analysis' } });
    if (environmentalCategory) {
      const environmentalTests = [
        {
          name: 'Water Quality Testing',
          description: 'Comprehensive analysis of water samples for chemical contaminants, heavy metals, and microbial presence.',
          price: 175.00,
          turnaroundTime: '5-7 business days',
          methodReference: 'EPA Methods',
          active: true,
          displayOrder: 1,
          categoryId: environmentalCategory.id
        },
        {
          name: 'Soil Contamination Analysis',
          description: 'Detection and quantification of pollutants and heavy metals in soil samples.',
          price: 195.00,
          turnaroundTime: '7-10 business days',
          methodReference: 'ICP-MS/AAS',
          active: true,
          displayOrder: 2,
          categoryId: environmentalCategory.id
        },
        {
          name: 'Air Quality Assessment',
          description: 'Analysis of air samples for particulate matter, VOCs, and other atmospheric pollutants.',
          price: 225.00,
          turnaroundTime: '5-7 business days',
          methodReference: 'GC-MS/HPLC',
          active: true,
          displayOrder: 3,
          categoryId: environmentalCategory.id
        },
        {
          name: 'Heavy Metals Analysis',
          description: 'Precise quantification of heavy metals in environmental and biological samples.',
          price: 185.00,
          turnaroundTime: '4-6 business days',
          methodReference: 'ICP-MS',
          active: true,
          displayOrder: 4,
          categoryId: environmentalCategory.id
        }
      ];

      for (const testData of environmentalTests) {
        const existingTest = await Test.findOne({ where: { name: testData.name, categoryId: environmentalCategory.id } });
        if (!existingTest) {
          await Test.create(testData);
          console.log(`  ✅ Created test: ${testData.name}`);
        }
      }
    }

    // Microbiological Testing Tests
    const microbiologicalCategory = await Category.findOne({ where: { name: 'Microbiological Testing' } });
    if (microbiologicalCategory) {
      const microbiologicalTests = [
        {
          name: 'Bacterial Identification',
          description: 'Isolation and identification of bacterial species from various sample types.',
          price: 135.00,
          turnaroundTime: '3-5 business days',
          methodReference: 'Culture & 16S rRNA Sequencing',
          active: true,
          displayOrder: 1,
          categoryId: microbiologicalCategory.id
        },
        {
          name: 'Fungal Analysis',
          description: 'Identification and characterization of fungal species in environmental and biological samples.',
          price: 145.00,
          turnaroundTime: '4-6 business days',
          methodReference: 'Culture & ITS Sequencing',
          active: true,
          displayOrder: 2,
          categoryId: microbiologicalCategory.id
        },
        {
          name: 'Antimicrobial Susceptibility Testing',
          description: 'Determination of microbial sensitivity to various antimicrobial agents.',
          price: 165.00,
          turnaroundTime: '5-7 business days',
          methodReference: 'Disk Diffusion/MIC',
          active: true,
          displayOrder: 3,
          categoryId: microbiologicalCategory.id
        },
        {
          name: 'Biofilm Analysis',
          description: 'Assessment of biofilm formation and characterization in various environments.',
          price: 195.00,
          turnaroundTime: '7-10 business days',
          methodReference: 'Microscopy & Culture',
          active: true,
          displayOrder: 4,
          categoryId: microbiologicalCategory.id
        }
      ];

      for (const testData of microbiologicalTests) {
        const existingTest = await Test.findOne({ where: { name: testData.name, categoryId: microbiologicalCategory.id } });
        if (!existingTest) {
          await Test.create(testData);
          console.log(`  ✅ Created test: ${testData.name}`);
        }
      }
    }

    // Molecular Diagnostics Tests
    const molecularCategory = await Category.findOne({ where: { name: 'Molecular Diagnostics' } });
    if (molecularCategory) {
      const molecularTests = [
        {
          name: 'PCR Analysis',
          description: 'Polymerase chain reaction for DNA amplification and detection.',
          price: 125.00,
          turnaroundTime: '2-3 business days',
          methodReference: 'Real-time PCR',
          active: true,
          displayOrder: 1,
          categoryId: molecularCategory.id
        },
        {
          name: 'DNA Sequencing',
          description: 'High-quality DNA sequencing for research and diagnostic applications.',
          price: 85.00,
          turnaroundTime: '3-5 business days',
          methodReference: 'Sanger Sequencing',
          active: true,
          displayOrder: 2,
          categoryId: molecularCategory.id
        },
        {
          name: 'Genetic Variant Analysis',
          description: 'Detection and analysis of genetic variants and mutations.',
          price: 295.00,
          turnaroundTime: '7-10 business days',
          methodReference: 'NGS/Sanger',
          active: true,
          displayOrder: 3,
          categoryId: molecularCategory.id
        }
      ];

      for (const testData of molecularTests) {
        const existingTest = await Test.findOne({ where: { name: testData.name, categoryId: molecularCategory.id } });
        if (!existingTest) {
          await Test.create(testData);
          console.log(`  ✅ Created test: ${testData.name}`);
        }
      }
    }

    // Material Characterization Tests
    const materialCategory = await Category.findOne({ where: { name: 'Material Characterization' } });
    if (materialCategory) {
      const materialTests = [
        {
          name: 'X-Ray Diffraction (XRD)',
          description: 'Crystal structure analysis and phase identification of materials.',
          price: 165.00,
          turnaroundTime: '3-5 business days',
          methodReference: 'Powder XRD',
          active: true,
          displayOrder: 1,
          categoryId: materialCategory.id
        },
        {
          name: 'Surface Analysis (XPS)',
          description: 'X-ray photoelectron spectroscopy for surface composition analysis.',
          price: 245.00,
          turnaroundTime: '5-7 business days',
          methodReference: 'XPS',
          active: true,
          displayOrder: 2,
          categoryId: materialCategory.id
        },
        {
          name: 'Thermal Analysis',
          description: 'Comprehensive thermal characterization including TGA, DSC, and DMA.',
          price: 185.00,
          turnaroundTime: '4-6 business days',
          methodReference: 'TGA/DSC/DMA',
          active: true,
          displayOrder: 3,
          categoryId: materialCategory.id
        }
      ];

      for (const testData of materialTests) {
        const existingTest = await Test.findOne({ where: { name: testData.name, categoryId: materialCategory.id } });
        if (!existingTest) {
          await Test.create(testData);
          console.log(`  ✅ Created test: ${testData.name}`);
        }
      }
    }

    // Pharmaceutical Analysis Tests
    const pharmaceuticalCategory = await Category.findOne({ where: { name: 'Pharmaceutical Analysis' } });
    if (pharmaceuticalCategory) {
      const pharmaceuticalTests = [
        {
          name: 'Drug Purity Analysis',
          description: 'Quantitative analysis of active pharmaceutical ingredients and impurities.',
          price: 195.00,
          turnaroundTime: '4-6 business days',
          methodReference: 'HPLC/UPLC',
          active: true,
          displayOrder: 1,
          categoryId: pharmaceuticalCategory.id
        },
        {
          name: 'Stability Testing',
          description: 'Assessment of pharmaceutical product stability under various conditions.',
          price: 325.00,
          turnaroundTime: '10-14 business days',
          methodReference: 'ICH Guidelines',
          active: true,
          displayOrder: 2,
          categoryId: pharmaceuticalCategory.id
        },
        {
          name: 'Dissolution Testing',
          description: 'In vitro dissolution testing for solid dosage forms.',
          price: 155.00,
          turnaroundTime: '3-5 business days',
          methodReference: 'USP Methods',
          active: true,
          displayOrder: 3,
          categoryId: pharmaceuticalCategory.id
        }
      ];

      for (const testData of pharmaceuticalTests) {
        const existingTest = await Test.findOne({ where: { name: testData.name, categoryId: pharmaceuticalCategory.id } });
        if (!existingTest) {
          await Test.create(testData);
          console.log(`  ✅ Created test: ${testData.name}`);
        }
      }
    }

    // Food & Beverage Testing Tests
    const foodCategory = await Category.findOne({ where: { name: 'Food & Beverage Testing' } });
    if (foodCategory) {
      const foodTests = [
        {
          name: 'Nutritional Analysis',
          description: 'Comprehensive nutritional profiling including macronutrients and micronutrients.',
          price: 145.00,
          turnaroundTime: '5-7 business days',
          methodReference: 'AOAC Methods',
          active: true,
          displayOrder: 1,
          categoryId: foodCategory.id
        },
        {
          name: 'Contaminant Screening',
          description: 'Detection of pesticides, heavy metals, and other contaminants in food products.',
          price: 225.00,
          turnaroundTime: '7-10 business days',
          methodReference: 'LC-MS/MS, GC-MS',
          active: true,
          displayOrder: 2,
          categoryId: foodCategory.id
        },
        {
          name: 'Shelf-Life Studies',
          description: 'Accelerated and real-time shelf-life testing for food products.',
          price: 395.00,
          turnaroundTime: '14-21 business days',
          methodReference: 'ASTM Methods',
          active: true,
          displayOrder: 3,
          categoryId: foodCategory.id
        }
      ];

      for (const testData of foodTests) {
        const existingTest = await Test.findOne({ where: { name: testData.name, categoryId: foodCategory.id } });
        if (!existingTest) {
          await Test.create(testData);
          console.log(`  ✅ Created test: ${testData.name}`);
        }
      }
    }

    // Toxicology Screening Tests
    const toxicologyCategory = await Category.findOne({ where: { name: 'Toxicology Screening' } });
    if (toxicologyCategory) {
      const toxicologyTests = [
        {
          name: 'Drug Screening Panel',
          description: 'Comprehensive screening for drugs of abuse and therapeutic drugs.',
          price: 125.00,
          turnaroundTime: '2-3 business days',
          methodReference: 'LC-MS/MS',
          active: true,
          displayOrder: 1,
          categoryId: toxicologyCategory.id
        },
        {
          name: 'Environmental Toxins',
          description: 'Detection of environmental toxins and industrial chemicals.',
          price: 195.00,
          turnaroundTime: '5-7 business days',
          methodReference: 'GC-MS/LC-MS',
          active: true,
          displayOrder: 2,
          categoryId: toxicologyCategory.id
        },
        {
          name: 'Cytotoxicity Assay',
          description: 'Assessment of cellular toxicity using various cell-based assays.',
          price: 165.00,
          turnaroundTime: '4-6 business days',
          methodReference: 'MTT/LDH Assay',
          active: true,
          displayOrder: 3,
          categoryId: toxicologyCategory.id
        }
      ];

      for (const testData of toxicologyTests) {
        const existingTest = await Test.findOne({ where: { name: testData.name, categoryId: toxicologyCategory.id } });
        if (!existingTest) {
          await Test.create(testData);
          console.log(`  ✅ Created test: ${testData.name}`);
        }
      }
    }

    // Final verification
    const finalCategories = await Category.findAll({
      where: { active: true, parentId: null },
      include: [{
        model: Test,
        as: 'tests',
        where: { active: true },
        required: false
      }]
    });

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`📊 Total active categories: ${finalCategories.length}`);
    
    let totalTests = 0;
    finalCategories.forEach(category => {
      const testCount = category.tests ? category.tests.length : 0;
      totalTests += testCount;
      console.log(`   - ${category.name}: ${testCount} tests`);
    });
    
    console.log(`🧪 Total tests: ${totalTests}`);

    // Seed Testimonials
    console.log('\n💬 Seeding testimonials...');
    const testimonials = [
      {
        name: 'Dr. Sarah Johnson',
        position: 'Research Director',
        company: 'BioTech Solutions Inc.',
        content: 'The analytical testing services provided were exceptional. The detailed reports and quick turnaround time helped us accelerate our research timeline significantly.',
        rating: 5,
        featured: true,
        active: true
      },
      {
        name: 'Michael Chen',
        position: 'Quality Control Manager',
        company: 'PharmaCorp Ltd.',
        content: 'Outstanding precision and reliability in pharmaceutical testing. Their expertise in regulatory compliance made our FDA submission process seamless.',
        rating: 5,
        featured: true,
        active: true
      },
      {
        name: 'Dr. Emily Rodriguez',
        position: 'Environmental Scientist',
        company: 'EcoAnalytics Group',
        content: 'Comprehensive environmental analysis with detailed methodology. The team\'s expertise in contamination detection is unmatched in the industry.',
        rating: 5,
        featured: true,
        active: true
      },
      {
        name: 'James Wilson',
        position: 'Food Safety Director',
        company: 'Fresh Foods International',
        content: 'Reliable food safety testing that ensures our products meet the highest standards. Their nutritional analysis reports are thorough and accurate.',
        rating: 5,
        featured: false,
        active: true
      },
      {
        name: 'Dr. Lisa Park',
        position: 'Materials Engineer',
        company: 'Advanced Materials Corp.',
        content: 'Excellent material characterization services. The XRD and surface analysis results provided crucial insights for our product development.',
        rating: 5,
        featured: false,
        active: true
      }
    ];

    for (const testimonialData of testimonials) {
      const existingTestimonial = await Testimonial.findOne({ 
        where: { name: testimonialData.name, company: testimonialData.company } 
      });
      if (!existingTestimonial) {
        await Testimonial.create(testimonialData);
        console.log(`  ✅ Created testimonial: ${testimonialData.name} - ${testimonialData.company}`);
      }
    }

    // Seed Government Contracts
    console.log('\n🏛️ Seeding government contracts...');
    const governmentContracts = [
      {
        title: 'EPA Environmental Monitoring Services',
        agency: 'Environmental Protection Agency',
        contractNumber: 'EPA-2024-001',
        description: 'Comprehensive environmental monitoring and analysis services for water quality assessment in federal facilities.',
        value: 2500000.00,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2026-01-14'),
        status: 'active',
        category: 'Environmental Testing',
        contactPerson: 'Dr. Jennifer Martinez',
        contactEmail: 'j.martinez@epa.gov',
        requirements: 'ISO 17025 accreditation required, specialized equipment for trace metal analysis, 24/7 emergency response capability',
        active: true
      },
      {
        title: 'DOD Materials Testing Program',
        agency: 'Department of Defense',
        contractNumber: 'DOD-2024-MT-007',
        description: 'Advanced materials characterization and testing services for military applications and equipment.',
        value: 1800000.00,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2027-02-28'),
        status: 'active',
        category: 'Materials Testing',
        contactPerson: 'Colonel Robert Thompson',
        contactEmail: 'r.thompson@defense.gov',
        requirements: 'Security clearance required, specialized testing for composite materials, compliance with MIL-STD specifications',
        active: true
      },
      {
        title: 'FDA Pharmaceutical Analysis Contract',
        agency: 'Food and Drug Administration',
        contractNumber: 'FDA-2024-PA-012',
        description: 'Independent pharmaceutical testing and analysis services for drug approval processes.',
        value: 3200000.00,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2027-01-31'),
        status: 'active',
        category: 'Pharmaceutical Testing',
        contactPerson: 'Dr. Amanda Foster',
        contactEmail: 'a.foster@fda.gov',
        requirements: 'GMP compliance, FDA registration, expertise in analytical method validation, CLIA certification',
        active: true
      },
      {
        title: 'USDA Food Safety Testing Initiative',
        agency: 'United States Department of Agriculture',
        contractNumber: 'USDA-2024-FS-005',
        description: 'Food safety testing and pathogen detection services for agricultural products and food processing facilities.',
        value: 1500000.00,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2026-03-31'),
        status: 'active',
        category: 'Food Safety',
        contactPerson: 'Dr. Michael Davis',
        contactEmail: 'm.davis@usda.gov',
        requirements: 'HACCP certification, rapid pathogen detection capabilities, mobile testing units available',
        active: true
      },
      {
        title: 'NIH Biomedical Research Support',
        agency: 'National Institutes of Health',
        contractNumber: 'NIH-2024-BR-018',
        description: 'Specialized biomedical testing and analysis services supporting NIH research initiatives.',
        value: 2100000.00,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active',
        category: 'Biomedical Research',
        contactPerson: 'Dr. Sarah Kim',
        contactEmail: 's.kim@nih.gov',
        requirements: 'Experience with clinical samples, IRB compliance, specialized molecular diagnostics capabilities',
        active: true
      }
    ];

    for (const contractData of governmentContracts) {
      const existingContract = await GovernmentContract.findOne({ 
        where: { contractNumber: contractData.contractNumber } 
      });
      if (!existingContract) {
        await GovernmentContract.create(contractData);
        console.log(`  ✅ Created government contract: ${contractData.title} (${contractData.contractNumber})`);
      }
    }

    // Final count
    const testimonialCount = await Testimonial.count({ where: { active: true } });
    const contractCount = await GovernmentContract.count({ where: { active: true } });

    console.log(`💬 Total testimonials: ${testimonialCount}`);
    console.log(`🏛️ Total government contracts: ${contractCount}`);
    console.log('\n✅ Your Railway database is now fully populated!');
    console.log('🌐 Visit your website to see all the services displayed.');

  } catch (error) {
    console.error('❌ Error seeding Railway database:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the function
if (require.main === module) {
  seedRailwayDatabase();
}

module.exports = seedRailwayDatabase;
