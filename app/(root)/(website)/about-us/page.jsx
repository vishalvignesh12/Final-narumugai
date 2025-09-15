import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import React from 'react'
import { Metadata } from 'next'

export const metadata = {
  title: "About Narumugai - Premium Saree Store | Traditional Indian Clothing",
  description: "Learn about Narumugai's journey in bringing authentic Indian sarees to modern women. Discover our commitment to quality, tradition, and customer satisfaction in saree fashion.",
  keywords: "about narumugai, saree store, traditional clothing, Indian fashion, authentic sarees, silk sarees, cotton sarees",
  openGraph: {
    title: "About Narumugai - Premium Saree Store",
    description: "Learn about Narumugai's journey in bringing authentic Indian sarees to modern women.",
    images: ['/about-narumugai-sarees.jpg'],
  },
};

const breadcrumb = {
  title: 'About Narumugai',
  links: [
    { label: 'About Us' },
  ]
}
const AboutUs = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Narumugai",
    "description": "Premium saree store bringing authentic Indian clothing to modern women",
    "url": "https://narumugai.com/about-us",
    "mainEntity": {
      "@type": "Organization",
      "name": "Narumugai",
      "description": "Premium saree and traditional Indian clothing store",
      "foundingDate": "2020",
      "founder": {
        "@type": "Person",
        "name": "Narumugai Founders"
      },
      "specialty": "Traditional Indian Sarees"
    }
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <WebsiteBreadcrumb props={breadcrumb} />
      <div className='lg:px-40 px-5 py-20'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='lg:text-3xl text-2xl font-bold mb-6 text-center text-gray-800'>About Narumugai - Your Trusted Saree Destination</h1>
          
          <div className='prose prose-lg max-w-none'>
            <p className='text-lg leading-relaxed mb-6'>
              Welcome to <strong>Narumugai</strong>, your premier destination for authentic Indian sarees and traditional clothing. 
              Founded with a deep reverence for Indian textile heritage, we are passionate about bringing you the finest 
              collection of <strong>traditional sarees</strong>, <strong>silk sarees</strong>, and <strong>designer sarees</strong> 
              that celebrate the timeless elegance of Indian craftsmanship.
            </p>
            
            <h2 className='text-xl font-semibold mb-4 text-primary'>Our Saree Heritage</h2>
            <p className='mb-6'>
              At Narumugai, we understand that a saree is not just clothing—it's a legacy, a story, and an expression of 
              grace. Our carefully curated collection features exquisite pieces sourced directly from renowned weaving 
              centers across India, including the silk sarees of Kanchipuram, the intricate Banarasi weaves, and the 
              comfortable cotton sarees perfect for everyday elegance.
            </p>
            
            <h2 className='text-xl font-semibold mb-4 text-primary'>What Makes Narumugai Special</h2>
            <div className='grid md:grid-cols-2 gap-6 mb-8'>
              <div className='bg-gray-50 p-6 rounded-lg'>
                <h3 className='font-semibold mb-3 text-primary'>Authentic Quality</h3>
                <p className='text-sm'>Every saree in our collection is carefully selected for its authenticity, 
                quality of fabric, and traditional craftsmanship. We work directly with weavers and artisans to 
                ensure you receive genuine products.</p>
              </div>
              <div className='bg-gray-50 p-6 rounded-lg'>
                <h3 className='font-semibold mb-3 text-primary'>Diverse Collection</h3>
                <p className='text-sm'>From grand wedding silk sarees to comfortable daily wear cotton sarees, 
                our collection caters to every occasion and personal style preference.</p>
              </div>
              <div className='bg-gray-50 p-6 rounded-lg'>
                <h3 className='font-semibold mb-3 text-primary'>Expert Curation</h3>
                <p className='text-sm'>Our team of saree experts carefully selects each piece, ensuring that 
                every saree meets our high standards of quality, design, and traditional authenticity.</p>
              </div>
              <div className='bg-gray-50 p-6 rounded-lg'>
                <h3 className='font-semibold mb-3 text-primary'>Customer Satisfaction</h3>
                <p className='text-sm'>Your happiness is our priority. From browsing our collection to 
                styling advice, we're here to make your saree shopping experience memorable and satisfying.</p>
              </div>
            </div>
            
            <h2 className='text-xl font-semibold mb-4 text-primary'>Our Commitment to Excellence</h2>
            <ul className='list-disc pl-6 mb-6 space-y-2'>
              <li><strong>Authentic Sourcing:</strong> We partner directly with traditional weavers and trusted suppliers to bring you genuine, high-quality sarees.</li>
              <li><strong>Quality Assurance:</strong> Each saree undergoes thorough quality checks to ensure superior fabric, color fastness, and craftsmanship.</li>
              <li><strong>Fast & Secure Delivery:</strong> We understand the excitement of receiving your new saree, so we ensure quick and safe delivery across India.</li>
              <li><strong>Expert Assistance:</strong> Our knowledgeable team is always ready to help with saree selection, styling tips, and care instructions.</li>
              <li><strong>Fair Pricing:</strong> We believe everyone should have access to beautiful sarees, which is why we offer competitive prices without compromising on quality.</li>
            </ul>
            
            <div className='bg-primary/10 p-6 rounded-lg mb-6'>
              <h2 className='text-xl font-semibold mb-3 text-primary'>Our Vision</h2>
              <p>
                To be India's most trusted online destination for traditional sarees, where every woman can 
                find her perfect saree that makes her feel confident, beautiful, and connected to our rich 
                cultural heritage. We envision a world where the art of saree draping and the beauty of 
                traditional textiles continue to flourish in modern times.
              </p>
            </div>
            
            <p className='text-center text-lg font-medium text-primary'>
              Thank you for choosing Narumugai. Let's celebrate the timeless beauty of Indian sarees together.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
