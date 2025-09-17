# OpenGraph Images Setup Guide

## Issues Fixed:

### 1. **Missing Images**
- ❌ Referenced images that didn't exist in the public directory
- ✅ Now using existing images from `/public/assets/images/`

### 2. **Incorrect Image Paths**
- ❌ Used absolute URLs that pointed to non-existent files
- ✅ Now using relative paths to existing files

### 3. **Empty Fallbacks**
- ❌ Empty strings when product images weren't available
- ✅ Now uses placeholder image as fallback

## Current Image Mappings:

### Product Pages:
- **Primary:** Product/variant media from Cloudinary
- **Fallback:** `/assets/images/img-placeholder.webp`

### Category Pages:
- **Designer Sarees:** `/assets/images/slider-2.png`
- **Silk Sarees:** `/assets/images/slider-3.png`
- **Cotton Sarees:** `/assets/images/slider-4.png`

### Main Layout:
- **Default OpenGraph:** `/assets/images/slider-1.png`

## Recommendations for Production:

### 1. Create Optimized OpenGraph Images
Create these images with dimensions **1200x630 pixels**:

```
public/
├── og-image.jpg (main site image)
├── images/
│   ├── designer-sarees-og.jpg
│   ├── silk-sarees-og.jpg
│   ├── cotton-sarees-og.jpg
│   └── product-placeholder-og.jpg
```

### 2. Image Requirements:
- **Format:** JPG or PNG
- **Size:** 1200x630 pixels (OpenGraph recommended)
- **File size:** Under 300KB for fast loading
- **Content:** Should represent your brand and category

### 3. Update Paths After Creating Images:

**For main layout:**
```javascript
images: [
  {
    url: "/og-image.jpg",
    width: 1200,
    height: 630,
    alt: "Narumugai Sarees Collection",
  },
],
```

**For category pages:**
```javascript
// Designer Sarees
url: '/images/designer-sarees-og.jpg'

// Silk Sarees  
url: '/images/silk-sarees-og.jpg'

// Cotton Sarees
url: '/images/cotton-sarees-og.jpg'
```

**For product pages:**
```javascript
url: variant?.media?.[0]?.secure_url || product?.media?.[0]?.secure_url || '/images/product-placeholder-og.jpg'
```

## Testing Your Images:

### 1. Facebook Sharing Debugger
URL: https://developers.facebook.com/tools/debug/

### 2. Twitter Card Validator
URL: https://cards-dev.twitter.com/validator

### 3. LinkedIn Post Inspector
URL: https://www.linkedin.com/post-inspector/

## Image Creation Tips:

1. **Use your actual product photos**
2. **Include your brand logo**
3. **Add text overlay for context**
4. **Use consistent brand colors**
5. **Test on different social platforms**

## Current Status: ✅ FIXED
- All image paths now point to existing files
- Proper fallbacks are in place
- No more broken image references
- OpenGraph will now display images correctly on social media