import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const manifest = {
      "name": "Narumugai - Premium Sarees Online",
      "short_name": "Narumugai",
      "description": "Discover exquisite collection of traditional and designer sarees at Narumugai. Shop premium silk sarees, cotton sarees, wedding sarees and more.",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#ec4899",
      "orientation": "portrait",
      "scope": "/",
      "lang": "en",
      "dir": "ltr",
      "categories": ["shopping", "fashion", "lifestyle"],
      "icons": [
        {
          "src": "/assets/images/favicon.ico",
          "sizes": "16x16 32x32 48x48",
          "type": "image/x-icon",
          "purpose": "any"
        },
        {
          "src": "/assets/images/logo-black.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any maskable"
        }
      ],
      "shortcuts": [
        {
          "name": "Shop Sarees",
          "short_name": "Shop",
          "description": "Browse our saree collection",
          "url": "/shop"
        },
        {
          "name": "My Account",
          "short_name": "Account",
          "description": "Access your account",
          "url": "/my-account"
        },
        {
          "name": "Shopping Cart",
          "short_name": "Cart",
          "description": "View your cart",
          "url": "/cart"
        }
      ]
    };

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    console.error('Error serving manifest:', error);
    return NextResponse.json(
      { error: 'Failed to load manifest' },
      { status: 500 }
    );
  }
}