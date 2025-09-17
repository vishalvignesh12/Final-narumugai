# OpenGraph Implementation Guide for Narumugai E-commerce

## Overview
This document outlines the OpenGraph metadata implementation for the Narumugai e-commerce platform, specifically focusing on product pages and category pages.

## OpenGraph Types Used

### 1. Product Pages (`type: 'website'`)
**Location:** `app/(root)/(website)/product/[slug]/page.jsx`

Product pages use the `website` type (the standard OpenGraph type) with additional product-specific metadata in the `other` field. This approach ensures maximum compatibility across all social media platforms while still providing rich e-commerce information.

#### Why `website` instead of `product`?
- **Compatibility:** `product` is not an official OpenGraph type and may cause validation errors
- **Platform Support:** All social media platforms support `website` type
- **Rich Metadata:** Product information is provided through additional meta tags
- **SEO Benefits:** Better indexing and understanding by search engines

#### Key Features:
- **Dynamic metadata generation** based on product and variant data
- **Multi-image support** with proper fallbacks
- **Enhanced product properties** including price, availability, condition
- **SEO-optimized descriptions** with variant-specific details
- **Structured data integration** with JSON-LD schema

#### Implementation Example:
```javascript
openGraph: {
    title: `${product.name} | Premium Saree Online | Narumugai`,
    description: `Buy ${product.name} online at best price. Premium quality saree with free shipping.`,
    type: 'website',
    url: `https://narumugai.com/product/${slug}`,
    siteName: 'Narumugai',
    locale: 'en_IN',
    images: [
        {
            url: variant?.media?.[0]?.secure_url || product?.media?.[0]?.secure_url || '',
            width: 1200,
            height: 630,
            alt: `${product.name} - ${variant?.color} ${variant?.size} | Narumugai Sarees`,
            type: 'image/jpeg'
        }
    ]
}
```

### 2. Category Pages (`type: 'website'`)
**Location:** `app/(root)/(website)/categories/*/page.jsx`

Category and collection pages also use the `website` type for maximum compatibility.

#### Implementation Example:
```javascript
openGraph: {
    title: 'Designer Sarees Online | Latest Designer Saree Collection | Narumugai',
    description: 'Explore our stunning collection of designer sarees featuring contemporary designs.',
    type: 'website',
    url: 'https://narumugai.com/categories/designer-sarees',
    siteName: 'Narumugai',
    locale: 'en_IN',
    images: [
        {
            url: 'https://narumugai.com/images/designer-sarees-collection.jpg',
            width: 1200,
            height: 630,
            alt: 'Designer Sarees Collection - Contemporary & Modern Styles | Narumugai',
            type: 'image/jpeg'
        }
    ]
}
```

## Enhanced Features

### 1. Twitter Cards
All product and category pages include comprehensive Twitter card metadata:
```javascript
twitter: {
    card: 'summary_large_image',
    site: '@narumugai',
    creator: '@narumugai',
    title: '...',
    description: '...',
    images: ['...']
}
```

### 2. Additional Metadata Properties
Product pages include additional e-commerce specific metadata:
```javascript
other: {
    'product:price:amount': variant.sellingPrice,
    'product:price:currency': 'INR',
    'product:availability': 'in stock',
    'product:condition': 'new',
    'product:brand': 'Narumugai',
    'product:retailer_item_id': variant._id || product._id,
    'product:category': product.category || 'Sarees',
    'product:color': variant?.color,
    'product:size': variant?.size,
    'business:contact_data:country_name': 'India',
    'business:contact_data:locality': 'Chennai',
    'business:contact_data:region': 'Tamil Nadu'
}
```

### 3. Mobile App Integration
Twitter cards include mobile app information for future app integration:
```javascript
app: {
    name: {
        iphone: 'Narumugai',
        ipad: 'Narumugai',
        googleplay: 'Narumugai'
    },
    id: {
        iphone: 'narumugai-app',
        ipad: 'narumugai-app',
        googleplay: 'com.narumugai.app'
    }
}
```

## Best Practices Implemented

### 1. Image Optimization
- **Standardized dimensions:** 1200x630 for optimal social media sharing
- **Proper alt text:** Descriptive and SEO-friendly
- **Multiple image support:** Shows additional product views
- **Fallback strategy:** Graceful handling of missing images

### 2. Dynamic Content
- **Product-specific metadata:** Generated from actual product data
- **Variant-aware:** Adapts to color and size selections
- **Real-time updates:** Reflects current product information

### 3. SEO Integration
- **Canonical URLs:** Prevents duplicate content issues
- **Structured data:** JSON-LD schema for rich snippets
- **Breadcrumb navigation:** Clear site hierarchy
- **Robot directives:** Proper indexing guidelines

### 4. Social Media Optimization
- **Platform-specific optimization:** Different metadata for different platforms
- **Rich previews:** Enhanced appearance in social feeds
- **Brand consistency:** Uniform presentation across platforms

## Testing Your Implementation

### 1. Facebook Sharing Debugger
URL: https://developers.facebook.com/tools/debug/
Test your product and category URLs to ensure proper OpenGraph rendering.

### 2. Twitter Card Validator
URL: https://cards-dev.twitter.com/validator
Validate Twitter card appearance for your pages.

### 3. LinkedIn Post Inspector
URL: https://www.linkedin.com/post-inspector/
Check how your content appears when shared on LinkedIn.

### 4. WhatsApp Preview
Share links in WhatsApp to test preview appearance.

## Implementation Checklist

- [x] Product pages use `type: 'website'` (correct OpenGraph type)
- [x] Category pages use `type: 'website'` (correct OpenGraph type)
- [x] Dynamic metadata generation
- [x] Multiple image support
- [x] Enhanced product properties via `other` field
- [x] Twitter card integration
- [x] Structured data (JSON-LD)
- [x] Mobile app metadata
- [x] Canonical URLs
- [x] Proper image dimensions (1200x630)
- [x] SEO-optimized descriptions
- [x] Brand consistency
- [x] Valid OpenGraph types for maximum compatibility

## Maintenance Notes

1. **Image URLs:** Ensure all product images are accessible and properly sized
2. **Content Updates:** Review metadata when product information changes
3. **Performance:** Monitor loading times for metadata generation
4. **Testing:** Regularly test social media sharing across platforms
5. **Analytics:** Track social media referral traffic to measure effectiveness

## Future Enhancements

1. **Rich Pins:** Pinterest product pin optimization
2. **Google Shopping:** Enhanced product metadata for Google Shopping
3. **Video Support:** Add product video metadata when available
4. **Reviews Integration:** Include review scores in OpenGraph data
5. **Inventory Status:** Real-time availability updates in metadata