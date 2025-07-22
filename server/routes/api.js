const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { Testimonial } = require('../models');

// Fallback data for categories
const fallbackCategories = [
  {
    id: 1,
    name: 'Biochemical Testing',
    description: 'Advanced biochemical analysis for research and diagnostic applications with state-of-the-art instrumentation.',
    imageUrl: '/images/categories/biochemical-testing.jpg',
  },
  {
    id: 2,
    name: 'Environmental Analysis',
    description: 'Comprehensive environmental testing for soil, water, and air quality monitoring and compliance.',
    imageUrl: '/images/categories/environmental-analysis.jpg',
  },
  {
    id: 3,
    name: 'Material Characterization',
    description: 'Detailed analysis of material properties and composition for quality control and research.',
    imageUrl: '/images/categories/material-characterization.jpg',
  },
  {
    id: 4,
    name: 'Microbiological Testing',
    description: 'Detection and identification of microorganisms for safety and quality control in various industries.',
    imageUrl: '/images/categories/microbiological-testing.jpg',
  },
  {
    id: 5,
    name: 'Food & Beverage Testing',
    description: 'Quality and safety testing for food and beverage products to ensure regulatory compliance.',
    imageUrl: '/images/categories/food-testing.jpg',
  },
  {
    id: 6,
    name: 'Pharmaceutical Analysis',
    description: 'Testing and validation services for pharmaceutical products and raw materials.',
    imageUrl: '/images/categories/pharmaceutical-analysis.jpg',
  },
  {
    id: 7,
    name: 'Toxicology Screening',
    description: 'Comprehensive toxicology testing services for clinical, forensic, and research applications.',
    imageUrl: '/images/categories/toxicology-screening.jpg',
  },
  {
    id: 8,
    name: 'Molecular Diagnostics',
    description: 'Advanced molecular testing for genetic analysis, disease diagnosis, and research applications.',
    imageUrl: '/images/categories/molecular-diagnostics.jpg',
  }
];

// Fallback testimonials for when API fails
const fallbackTestimonials = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    role: 'Research Director',
    company: 'BioTech Solutions',
    quote: 'Outstanding precision and reliability in every test result.',
    avatar: 'SJ',
    isActive: true,
    displayOrder: 1
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Quality Manager',
    company: 'PharmaCorp',
    quote: 'Fast turnaround times without compromising on quality.',
    avatar: 'MC',
    isActive: true,
    displayOrder: 2
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    role: 'Lab Director',
    company: 'Environmental Labs',
    quote: 'Their expertise has been invaluable to our research.',
    avatar: 'ER',
    isActive: true,
    displayOrder: 3
  }
];

// Fallback API routes for categories
router.get('/categories', async (req, res) => {
  try {
    console.log('Fallback API: Serving categories');
    return res.status(200).json({
      success: true,
      count: fallbackCategories.length,
      data: fallbackCategories
    });
  } catch (error) {
    console.error('Fallback API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Fallback API routes for testimonials
router.get('/testimonials', async (req, res) => {
  try {
    console.log('Fallback API: Serving testimonials');
    return res.status(200).json(fallbackTestimonials);
  } catch (error) {
    console.error('Fallback API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Fallback API routes for government contracts
router.get('/government-contracts', async (req, res) => {
  try {
    console.log('Fallback API: Serving government contracts');
    return res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Fallback API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
