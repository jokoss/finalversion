import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../utils/api';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
  Fade,
  Slide,
  useTheme,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
  CardMedia,
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon, 
  Science as ScienceIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  Timeline as TimelineIcon,
  Groups as GroupsIcon,
  Star as StarIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';

// Fallback data moved outside components to prevent infinite loops
const FALLBACK_SERVICES = [
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
  },
  {
    id: 9,
    name: 'Clinical Chemistry',
    description: 'Comprehensive clinical chemistry testing for medical diagnosis and patient monitoring.',
    imageUrl: '/images/categories/clinical-chemistry.jpg',
  }
];

const FALLBACK_TESTIMONIALS = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Research Director',
    company: 'BioTech Solutions',
    quote: 'Outstanding precision and reliability in every test result.',
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Quality Manager',
    company: 'PharmaCorp',
    quote: 'Fast turnaround times without compromising on quality.',
    avatar: 'MC',
  },
  {
    name: 'Dr. Emily Rodriguez',
    role: 'Lab Director',
    company: 'Environmental Labs',
    quote: 'Their expertise has been invaluable to our research.',
    avatar: 'ER',
  },
];

// Modern, stunning Hero section with gradient backgrounds and animations
const Hero = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Animate stats counter
    const statsTimer = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % 3);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(statsTimer);
    };
  }, []);

  const stats = [
    { icon: <SpeedIcon />, value: '99.9%', label: 'Accuracy Rate', color: theme.palette.primary.main },
    { icon: <SecurityIcon />, value: '24h', label: 'Turnaround', color: theme.palette.secondary.main },
    { icon: <TrendingUpIcon />, value: '50,000+', label: 'Tests Annually', color: theme.palette.tertiary?.main || '#7E57C2' },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.main}15 0%, 
          ${theme.palette.secondary.main}10 25%, 
          ${theme.palette.primary.main}05 50%, 
          ${theme.palette.secondary.main}15 75%, 
          ${theme.palette.primary.main}20 100%)`,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(11, 77, 131, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 163, 180, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(126, 87, 194, 0.06) 0%, transparent 50%)
          `,
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        },
        '@keyframes rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}
    >
      {/* Animated geometric shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: `2px solid ${theme.palette.primary.main}20`,
          opacity: 0.3,
          animation: 'rotate 30s linear infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '3%',
          width: '300px',
          height: '300px',
          transform: 'rotate(45deg)',
          border: `2px solid ${theme.palette.secondary.main}25`,
          opacity: 0.4,
          animation: 'rotate 25s linear infinite reverse',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '30px',
          border: `2px solid ${theme.palette.tertiary?.main || '#7E57C2'}30`,
          opacity: 0.5,
          animation: 'float 15s ease-in-out infinite',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={7}>
            <Fade in={isVisible} timeout={1000}>
              <Box>
                <Chip
                  icon={<VerifiedIcon />}
                  label="Trusted by 500+ Organizations"
                  sx={{
                    mb: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.primary.main}30`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    fontSize: '0.9rem',
                    height: '40px',
                  }}
                />
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.1,
                    mb: 3,
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '3rem', md: '4.5rem' },
                  }}
                >
                  Precision
                  <Box component="span" sx={{
                    display: 'block',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.tertiary?.main || '#7E57C2'})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Analytical Testing
                  </Box>
                </Typography>
                <Typography
                  variant="h5"
                  paragraph
                  sx={{
                    mb: 5,
                    fontWeight: 400,
                    lineHeight: 1.7,
                    maxWidth: '600px',
                    color: 'text.primary',
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                  }}
                >
                  Delivering cutting-edge analytical solutions with unmatched accuracy and reliability for research, industry, and healthcare applications.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 6 }}>
                  <Button
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to="/services"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 2,
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Explore Services
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={RouterLink}
                    to="/contact"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      color: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                      fontWeight: 600,
                      px: 4,
                      py: 2,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderWidth: '2px',
                        background: `${theme.palette.primary.main}10`,
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Get Quote
                  </Button>
                </Stack>
              </Box>
            </Fade>
          </Grid>
          <Grid item xs={12} md={5}>
            <Slide direction="left" in={isVisible} timeout={1200}>
              <Box sx={{ position: 'relative' }}>
                {/* Enhanced Stats Cards */}
                <Grid container spacing={3}>
                  {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={index === 2 ? 12 : 6} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          textAlign: 'center',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: `2px solid ${stat.color}20`,
                          borderRadius: '20px',
                          color: stat.color,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          transform: currentStat === index ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.5s ease',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            mx: 'auto',
                            mb: 2,
                            background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`,
                            color: stat.color,
                          }}
                        >
                          {React.cloneElement(stat.icon, { fontSize: 'large' })}
                        </Avatar>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Slide>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Enhanced Featured Services Section
const FeaturedServices = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fallback services for when API fails
  const fallbackServices = [
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/categories');
        
        console.log('Homepage - categories loaded:', response.data);
        
        const categoriesData = response.data.data || response.data;
        
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        // Take first 9 categories for featured section (3 rows of 3)
        setCategories(categoriesData.slice(0, 9));
        } else {
          console.log('No categories found in API response. Using fallback data.');
          setCategories(FALLBACK_SERVICES);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching categories for homepage:', err);
        console.log('Using fallback categories data due to API error');
        setCategories(FALLBACK_SERVICES);
        setError('');  // Don't show error to user since we're using fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array - only run once on mount

  // Icon mapping for different service types
  const getServiceIcon = (name) => {
    const iconMap = {
      'biochemical': <ScienceIcon sx={{ fontSize: '3rem' }} />,
      'environmental': <TimelineIcon sx={{ fontSize: '3rem' }} />,
      'material': <VerifiedIcon sx={{ fontSize: '3rem' }} />,
      'microbiological': <ScienceIcon sx={{ fontSize: '3rem' }} />,
      'molecular': <TimelineIcon sx={{ fontSize: '3rem' }} />,
      'pharmaceutical': <VerifiedIcon sx={{ fontSize: '3rem' }} />,
      'food': <ScienceIcon sx={{ fontSize: '3rem' }} />,
      'toxicology': <TimelineIcon sx={{ fontSize: '3rem' }} />,
    };
    
    const key = Object.keys(iconMap).find(k => name.toLowerCase().includes(k));
    return iconMap[key] || <ScienceIcon sx={{ fontSize: '3rem' }} />;
  };

  // Color mapping for different services
  const getServiceColor = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.tertiary?.main || '#7E57C2',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ py: 12, background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 12, background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Our Expertise"
            sx={{
              mb: 3,
              background: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          />
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
            }}
          >
            Featured Services
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              fontWeight: 400,
              color: 'text.secondary',
              lineHeight: 1.6,
            }}
          >
            Discover our comprehensive range of analytical testing services powered by cutting-edge technology
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {categories.map((service, index) => {
            const serviceColor = getServiceColor(index);
            const serviceGradient = `linear-gradient(135deg, ${serviceColor}20, ${serviceColor}40)`;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={service.id || index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${serviceColor}20`,
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                      border: `2px solid ${serviceColor}40`,
                    }
                  }}
                >
                  {service.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={service.imageUrl || `https://source.unsplash.com/random/400x300?${service.name.replace(/\s+/g, ',')}`}
                      alt={service.name}
                      sx={{ borderRadius: '24px 24px 0 0' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 5, textAlign: 'center' }}>
                    {!service.imageUrl && (
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: serviceGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          color: serviceColor,
                        }}
                      >
                        {getServiceIcon(service.name)}
                      </Box>
                    )}
                    <Typography 
                      gutterBottom 
                      variant="h4" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        color: 'text.primary',
                      }}
                    >
                      {service.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        lineHeight: 1.7,
                        fontSize: '1.1rem',
                      }}
                    >
                      {service.description || 'Comprehensive testing services for various analytical needs.'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 4, pt: 0, justifyContent: 'center' }}>
                    <Button 
                      component={RouterLink} 
                      to={`/services/${service.id}`}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: serviceColor,
                        '&:hover': {
                          background: `${serviceColor}10`,
                        }
                      }}
                    >
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/services"
            endIcon={<ArrowForwardIcon />}
            size="large"
            sx={{ 
              px: 6, 
              py: 2,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1.1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            View All Services
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Enhanced CTA Section with testimonials
const CtaSection = () => {
  const theme = useTheme();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fallback testimonials for when API fails
  const fallbackTestimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Research Director',
      company: 'BioTech Solutions',
      quote: 'Outstanding precision and reliability in every test result.',
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Quality Manager',
      company: 'PharmaCorp',
      quote: 'Fast turnaround times without compromising on quality.',
      avatar: 'MC',
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Lab Director',
      company: 'Environmental Labs',
      quote: 'Their expertise has been invaluable to our research.',
      avatar: 'ER',
    },
  ];
  
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await api.get('/testimonials');
        
        console.log('Homepage - testimonials loaded:', response.data);
        
        const testimonialsData = response.data || [];
        
        if (Array.isArray(testimonialsData) && testimonialsData.length > 0) {
          setTestimonials(testimonialsData);
        } else {
          console.log('No testimonials found in API response. Using fallback data.');
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      } catch (err) {
        console.error('Error fetching testimonials for homepage:', err);
        console.log('Using fallback testimonials data due to API error');
        setTestimonials(FALLBACK_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []); // Empty dependency array - only run once on mount
  
  return (
    <Box 
      sx={{ 
        py: 12,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}05, ${theme.palette.secondary.main}10)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography 
              variant="h5" 
              paragraph 
              sx={{ 
                fontWeight: 400, 
                mb: 5,
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              Join hundreds of satisfied clients who trust us with their analytical testing needs. Get expert consultation and competitive pricing today.
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 5 }}>
              {[
                { icon: <SpeedIcon />, title: 'Fast Turnaround', desc: 'Get results in 24-48 hours' },
                { icon: <VerifiedIcon />, title: 'Certified Results', desc: 'ISO compliant testing standards' },
                { icon: <GroupsIcon />, title: 'Expert Team', desc: 'PhD-level scientists and technicians' },
                { icon: <StarIcon />, title: 'Premium Quality', desc: '99.9% accuracy guarantee' },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}30)`,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/contact"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 2,
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Contact Us Today
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/services"
                sx={{
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                  borderWidth: '2px',
                  fontWeight: 600,
                  px: 4,
                  py: 2,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderWidth: '2px',
                    background: `${theme.palette.primary.main}10`,
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Explore Services
              </Button>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: { md: 4 } }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                What Our Clients Say
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Stack spacing={3}>
                  {testimonials.slice(0, 3).map((testimonial, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0,0,0,0.05)',
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{testimonial.quote}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ background: theme.palette.primary.main }}>
                          {testimonial.avatar || testimonial.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}, {testimonial.company}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Enhanced HomePage component
const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" paragraph>
            {errorMessage || 'We apologize for the inconvenience. Please try refreshing the page.'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Container>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Hero />
      <FeaturedServices />
      <CtaSection />
    </Box>
  );
};

export default HomePage;
