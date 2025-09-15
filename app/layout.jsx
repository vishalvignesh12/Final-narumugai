import GlobalProvider from "@/components/Application/GlobalProvider";
import "./globals.css";
import { Assistant } from 'next/font/google'
import { ToastContainer } from 'react-toastify';
const assistantFont = Assistant({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: {
    default: "Narumugai - Premium Sarees Online | Traditional Indian Sarees",
    template: "%s | Narumugai Sarees"
  },
  description: "Discover exquisite collection of traditional and designer sarees at Narumugai. Shop premium silk sarees, cotton sarees, wedding sarees and more with fast delivery across India.",
  keywords: "sarees online, silk sarees, cotton sarees, designer sarees, wedding sarees, traditional sarees, Indian sarees, saree shopping, Narumugai",
  authors: [{ name: "Narumugai" }],
  creator: "Narumugai",
  publisher: "Narumugai",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://narumugai.com",
    title: "Narumugai - Premium Sarees Online | Traditional Indian Sarees",
    description: "Discover exquisite collection of traditional and designer sarees at Narumugai. Shop premium silk sarees, cotton sarees, wedding sarees and more.",
    siteName: "Narumugai",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Narumugai Sarees Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Narumugai - Premium Sarees Online",
    description: "Discover exquisite collection of traditional and designer sarees at Narumugai.",
    images: ["/og-image.jpg"],
    creator: "@narumugai",
  },
  verification: {
    google: "google-verification-code",
    yandex: "yandex-verification-code",
  },
  category: "fashion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://narumugai.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ec4899" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              "name": "Narumugai",
              "description": "Premium sarees and traditional Indian clothing store",
              "url": "https://narumugai.com",
              "logo": "https://narumugai.com/logo.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Narumugai market",
                "addressLocality": "Lucknow",
                "addressRegion": "Uttar Pradesh",
                "postalCode": "256320",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-8569874589",
                "contactType": "customer service",
                "availableLanguage": ["English", "Hindi"]
              },
              "sameAs": [
                "https://www.facebook.com/narumugai",
                "https://www.instagram.com/narumugai",
                "https://www.youtube.com/narumugai"
              ],
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                ],
                "opens": "09:00",
                "closes": "21:00"
              },
              "priceRange": "₹₹",
              "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"]
            })
          }}
        />
      </head>
      <body
        className={`${assistantFont.className} antialiased`}
      >
        <GlobalProvider>
          <ToastContainer />
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
