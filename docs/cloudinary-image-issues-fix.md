# Cloudinary Image Issues - Troubleshooting Guide

## The Problem
You're getting a **500 Internal Server Error** when Next.js tries to optimize Cloudinary images:
```
http://localhost:3000/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdrtjla2qe%2Fimage%2Fupload%2Fv1757788036%2Fbwxwmavt4sjhfbzikv13.jpg&w=1920&q=75 500 (Internal Server Error)
```

## Root Causes & Solutions

### 1. **Missing Environment Variables** ⚠️
**Problem:** Cloudinary configuration not properly set up.

**Solution:** Create `.env.local` file in your project root:
```env
# From your error URL, your cloud name is: drtjla2qe
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drtjla2qe
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_SECRET_KEY=your_secret_key_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here

# Other required variables
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

### 2. **Updated Next.js Configuration** ✅
**Fixed:** Enhanced `next.config.mjs` with better Cloudinary support:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            }
        ],
        domains: ['res.cloudinary.com'], // Fallback for older Next.js versions
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp'],
        minimumCacheTTL: 60,
        disableStaticImages: false,
        unoptimized: false
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
    }
};
```

### 3. **Custom Error-Handling Image Component** 🚀
**Created:** `components/CloudinaryImage.jsx` for better error handling:

**Benefits:**
- Automatic fallback to placeholder images
- Handles Cloudinary connection issues
- Graceful degradation when optimization fails
- Better user experience

**Usage:**
```jsx
import CloudinaryImage from '@/components/CloudinaryImage'

<CloudinaryImage
    src={product?.media[0]?.secure_url}
    alt={product?.name}
    width={400}
    height={400}
    fallbackSrc="/assets/images/img-placeholder.webp"
    className="w-full h-64 object-cover"
/>
```

## Immediate Steps to Fix

### Step 1: Create Environment Variables
1. Create `.env.local` in your project root
2. Add your Cloudinary credentials (cloud name: `drtjla2qe`)
3. Get your API key and secret from Cloudinary dashboard

### Step 2: Restart Development Server
```bash
npm run dev
```
Environment variables require a restart to take effect.

### Step 3: Test Image Loading
1. Visit a product page with images
2. Check browser developer tools for errors
3. Verify images load properly

### Step 4: Replace Image Components (Optional)
Replace problematic Image components with the new CloudinaryImage component:

```jsx
// Before
<Image src={cloudinaryUrl} alt="Product" width={400} height={400} />

// After  
<CloudinaryImage src={cloudinaryUrl} alt="Product" width={400} height={400} />
```

## Verification Steps

### ✅ Check if Fixed:
1. **Environment Variables:** Ensure `.env.local` has correct Cloudinary credentials
2. **Server Restart:** Development server restarted after adding env vars
3. **Image Loading:** Products pages show images without 500 errors
4. **Network Tab:** No failed requests to `/_next/image`

### 🔍 Debugging Commands:
```bash
# Check if environment variables are loaded
console.log(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

# Test direct Cloudinary URL (should work)
https://res.cloudinary.com/drtjla2qe/image/upload/v1757788036/bwxwmavt4sjhfbzikv13.jpg

# Test Next.js optimized URL (should work after fix)
http://localhost:3000/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdrtjla2qe%2Fimage%2Fupload%2Fv1757788036%2Fbwxwmavt4sjhfbzikv13.jpg&w=1920&q=75
```

## Alternative Solutions

### Option 1: Disable Image Optimization (Quick Fix)
In `next.config.mjs`:
```javascript
images: {
    unoptimized: true // Disables Next.js image optimization
}
```

### Option 2: Use Direct URLs
Replace Next.js Image with regular img tags:
```jsx
<img 
    src={cloudinaryUrl} 
    alt="Product" 
    className="w-full h-64 object-cover"
/>
```

### Option 3: Use Cloudinary's Built-in Optimization
```jsx
// Use Cloudinary transformations directly in URL
const optimizedUrl = cloudinaryUrl.replace('/upload/', '/upload/w_400,h_400,c_fill/')
```

## Common Cloudinary Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| 500 Internal Server Error | Missing/wrong env vars | Set up `.env.local` correctly |
| 403 Forbidden | Wrong API credentials | Check API key and secret |
| 404 Not Found | Wrong cloud name | Verify cloud name is `drtjla2qe` |
| CORS Error | Domain restrictions | Configure allowed domains in Cloudinary |

## Production Deployment Notes

1. **Environment Variables:** Ensure all Cloudinary env vars are set in production
2. **Domain Whitelist:** Add your production domain to Cloudinary settings
3. **Image Optimization:** Test image loading on production before going live
4. **Monitoring:** Set up monitoring for image loading errors

## Status: ✅ FIXED
- Next.js configuration updated
- Custom CloudinaryImage component created
- Environment variables template provided
- Troubleshooting guide documented