// Script to populate database via API calls
// This script should be run after the Next.js server is started

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Sample categories
const sampleCategories = [
  { name: 'Silk Sarees', slug: 'silk-sarees' },
  { name: 'Cotton Sarees', slug: 'cotton-sarees' },
  { name: 'Designer Sarees', slug: 'designer-sarees' },
  { name: 'Party Wear Sarees', slug: 'party-wear-sarees' },
  { name: 'Casual Sarees', slug: 'casual-sarees' }
];

// Sample products
const sampleProducts = [
  {
    name: 'Premium Banarasi Silk Saree',
    slug: 'premium-banarasi-silk-saree',
    category: '', // Will be filled after category creation
    mrp: 4999,
    sellingPrice: 2999,
    discountPercentage: 40,
    description: 'Beautiful Banarasi silk saree with intricate gold zari work, perfect for weddings and special occasions.'
  },
  {
    name: 'Elegant Kanjivaram Silk Saree',
    slug: 'elegant-kanjivaram-silk-saree',
    category: '', // Will be filled after category creation
    mrp: 5999,
    sellingPrice: 3599,
    discountPercentage: 40,
    description: 'Traditional Kanjivaram silk saree with rich silk fabric and beautiful border design.'
  },
  {
    name: 'Designer Cotton Saree',
    slug: 'designer-cotton-saree',
    category: '', // Will be filled after category creation
    mrp: 2999,
    sellingPrice: 1799,
    discountPercentage: 40,
    description: 'Lightweight cotton saree with modern design, perfect for daily wear.'
  },
  {
    name: 'Luxury Party Wear Saree',
    slug: 'luxury-party-wear-saree',
    category: '', // Will be filled after category creation
    mrp: 6999,
    sellingPrice: 4199,
    discountPercentage: 40,
    description: 'Stunning party wear saree with embellishments, perfect for evening events.'
  }
];

const populateData = async () => {
  try {
    console.log('Starting to populate database via API...');
    
    // Create categories
    const createdCategories = [];
    console.log('Creating categories...');
    
    for (const category of sampleCategories) {
      try {
        const response = await axios.post(`${API_BASE}/category/create`, category);
        if (response.data.success) {
          console.log(`✓ Created category: ${category.name}`);
          createdCategories.push({ ...category, _id: response.data.data._id });
        } else {
          console.log(`✗ Failed to create category: ${category.name} - ${response.data.message}`);
        }
      } catch (error) {
        console.log(`✗ Error creating category ${category.name}:`, error.response?.data || error.message);
      }
    }
    
    if (createdCategories.length === 0) {
      console.log('No categories were created. Exiting.');
      return;
    }
    
    // Update products with category IDs (using first category for all products for simplicity)
    const categoryId = createdCategories[0]._id;
    const productsWithCategory = sampleProducts.map(product => ({
      ...product,
      category: categoryId
    }));
    
    // Create products using faker API (since we don't have a direct product creation API)
    console.log('Creating products using faker API...');
    try {
      const response = await axios.post(`${API_BASE}/faker/product`);
      if (response.data.success) {
        console.log('✓ Created sample products and variants using faker API');
      } else {
        console.log('✗ Failed to create sample products:', response.data.message);
      }
    } catch (error) {
      console.log('✗ Error creating sample products:', error.response?.data || error.message);
    }
    
    console.log('Database population completed!');
    
  } catch (error) {
    console.error('Error populating database:', error.message);
  }
};

// Wait a bit for the server to start, then run the population
setTimeout(populateData, 5000);