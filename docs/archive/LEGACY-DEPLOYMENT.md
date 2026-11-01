# Deployment Guide for GoDaddy cPanel

## Important Notice
This Next.js application uses server-side features (API routes, MongoDB, authentication) that require Node.js hosting. GoDaddy's basic cPanel hosting typically only supports static files and PHP.

## Deployment Options

### Option 1: Static Export (Limited Functionality)
If you must use GoDaddy cPanel hosting:

1. **Modify Next.js Configuration**
   Update `next.config.js` to enable static export:
   ```js
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   };
   ```

2. **Build for Static Export**
   ```bash
   npm run build
   ```
   This creates an `out` folder with static files.

3. **Upload to cPanel**
   - Compress the `out` folder contents
   - Upload to your domain's `public_html` folder via cPanel File Manager
   - Extract the files

**Limitations**: No server-side features (API routes, authentication, database operations, payment processing)

### Option 2: Use Node.js Hosting (Recommended)
For full functionality, consider these alternatives:

#### A. Upgrade GoDaddy Plan
- Check if GoDaddy offers Node.js hosting plans
- Look for "Web Hosting Plus" or "Business" plans that support Node.js

#### B. Alternative Hosting Providers
- **Vercel** (Recommended for Next.js): Free tier available
- **Netlify**: Good for static sites with serverless functions
- **Railway**: Node.js hosting
- **DigitalOcean App Platform**: Affordable Node.js hosting
- **Heroku**: Popular for Node.js apps

## Steps for Full Deployment (Node.js Hosting)

### 1. Environment Setup
Create `.env.local` file with your production values:
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
# ... other environment variables
```

### 2. Database Setup
- Set up MongoDB Atlas (cloud database)
- Update connection string in environment variables

### 3. Build and Deploy
```bash
npm run build
npm start
```

### 4. Configure Domain
- Point your GoDaddy domain to your hosting provider
- Update DNS records as required

## Quick Setup for Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   Add all required environment variables in Vercel dashboard

4. **Connect Domain**
   In Vercel dashboard, add your GoDaddy domain

## Environment Variables Needed
See `.env.example` for all required environment variables.

## Database Migration
If moving from local development:
1. Export your local MongoDB data
2. Import to MongoDB Atlas
3. Update connection string

## Post-Deployment Checklist
- [ ] All environment variables configured
- [ ] Database connected and accessible
- [ ] Payment gateway (Razorpay) configured
- [ ] Email service working
- [ ] Cloudinary images loading
- [ ] Domain properly connected
- [ ] SSL certificate active
- [ ] Test all functionality

## Troubleshooting
- Check environment variables are properly set
- Verify database connection
- Ensure all external services (Cloudinary, Razorpay) are configured
- Check server logs for errors