import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import models
import CategoryModel from '../models/Category.model.js';
import ProductModel from '../models/Product.model.js';
import ProductVariantModel from '../models/ProductVariant.model.js';
import MediaModel from '../models/Media.model.js';

// Connect to database
const connectDB = async () => {
  try {
    // Use a default connection string if MONGODB_URI is not set
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/YT-NEXTJS-ECOMMERCE';
    await mongoose.connect(mongoUri, {
      dbName: 'YT-NEXTJS-ECOMMERCE',
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample media data (in a real scenario, you would upload actual images to Cloudinary)
const sampleMedia = [
  {
    secure_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    alt: 'Sample Product Image 1'
  },
  {
    secure_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    alt: 'Sample Product Image 2'
  },
  {
    secure_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    alt: 'Sample Product Image 3'
  },
  {
    secure_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
    alt: 'Sample Product Image 4'
  }
];

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
    mrp: 4999,
    sellingPrice: 2999,
    discountPercentage: 40,
    description: 'Beautiful Banarasi silk saree with intricate gold zari work, perfect for weddings and special occasions.'
  },
  {
    name: 'Elegant Kanjivaram Silk Saree',
    slug: 'elegant-kanjivaram-silk-saree',
    mrp: 5999,
    sellingPrice: 3599,
    discountPercentage: 40,
    description: 'Traditional Kanjivaram silk saree with rich silk fabric and beautiful border design.'
  },
  {
    name: 'Designer Cotton Saree',
    slug: 'designer-cotton-saree',
    mrp: 2999,
    sellingPrice: 1799,
    discountPercentage: 40,
    description: 'Lightweight cotton saree with modern design, perfect for daily wear.'
  },
  {
    name: 'Luxury Party Wear Saree',
    slug: 'luxury-party-wear-saree',
    mrp: 6999,
    sellingPrice: 4199,
    discountPercentage: 40,
    description: 'Stunning party wear saree with embellishments, perfect for evening events.'
  }
];

const populateDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await CategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
    await ProductVariantModel.deleteMany({});
    await MediaModel.deleteMany({});
    
    console.log('Existing data cleared');

    // Create sample media
    const createdMedia = [];
    for (const media of sampleMedia) {
      const newMedia = new MediaModel(media);
      const savedMedia = await newMedia.save();
      createdMedia.push(savedMedia);
    }
    console.log(`Created ${createdMedia.length} media items`);

    // Create categories
    const createdCategories = [];
    for (const category of sampleCategories) {
      const newCategory = new CategoryModel(category);
      const savedCategory = await newCategory.save();
      createdCategories.push(savedCategory);
    }
    console.log(`Created ${createdCategories.length} categories`);

    // Create products
    const createdProducts = [];
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = {
        ...sampleProducts[i],
        category: createdCategories[i % createdCategories.length]._id,
        media: [
          createdMedia[0]._id,
          createdMedia[1]._id
        ]
      };
      
      const newProduct = new ProductModel(productData);
      const savedProduct = await newProduct.save();
      createdProducts.push(savedProduct);
      
      // Create variants for each product
      const colors = ['Red', 'Blue', 'Green', 'Black'];
      const sizes = ['S', 'M', 'L'];
      
      for (const color of colors) {
        for (const size of sizes) {
          const variantData = {
            product: savedProduct._id,
            color,
            size,
            mrp: savedProduct.mrp,
            sellingPrice: savedProduct.sellingPrice,
            discountPercentage: savedProduct.discountPercentage,
            sku: `${savedProduct.slug}-${color}-${size}`,
            stock: Math.floor(Math.random() * 50) + 10,
            media: [
              createdMedia[2]._id,
              createdMedia[3]._id
            ]
          };
          
          const newVariant = new ProductVariantModel(variantData);
          await newVariant.save();
        }
      }
    }
    
    console.log(`Created ${createdProducts.length} products with variants`);
    console.log('Database populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
};

populateDatabase();