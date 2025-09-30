'use client'
import React, { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useFetch from '@/hooks/useFetch';

const Filter = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedColor, setSelectedColor] = useState([]);
    const [selectedSize, setSelectedSize] = useState([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    const { data: categoryData } = useFetch('/api/category/get-category');
    const { data: colorData } = useFetch('/api/product-variant/colors');
    const { data: sizeData } = useFetch('/api/product-variant/sizes');

    // Initialize selected filters from URL on component mount
    useEffect(() => {
        const categories = searchParams.get('category') ? searchParams.get('category').split(',') : [];
        const colors = searchParams.get('color') ? searchParams.get('color').split(',') : [];
        const sizes = searchParams.get('size') ? searchParams.get('size').split(',') : [];
        
        setSelectedCategory(categories);
        setSelectedColor(colors);
        setSelectedSize(sizes);
    }, [searchParams]);

    const handleCategoryFilter = (categorySlug) => {
        let newSelectedCategory = [...selectedCategory];
        
        if (newSelectedCategory.includes(categorySlug)) {
            newSelectedCategory = newSelectedCategory.filter(cat => cat !== categorySlug);
        } else {
            newSelectedCategory.push(categorySlug);
        }
        
        setSelectedCategory(newSelectedCategory);
        
        const urlSearchParams = new URLSearchParams(searchParams.toString());
        
        if (newSelectedCategory.length > 0) {
            urlSearchParams.set('category', newSelectedCategory.join(','));
        } else {
            urlSearchParams.delete('category');
        }
        
        router.push(`${WEBSITE_SHOP}?${urlSearchParams}`);
    };

    const handleColorFilter = (color) => {
        let newSelectedColor = [...selectedColor];
        
        if (newSelectedColor.includes(color)) {
            newSelectedColor = newSelectedColor.filter(cat => cat !== color);
        } else {
            newSelectedColor.push(color);
        }
        
        setSelectedColor(newSelectedColor);
        
        const urlSearchParams = new URLSearchParams(searchParams.toString());
        
        if (newSelectedColor.length > 0) {
            urlSearchParams.set('color', newSelectedColor.join(','));
        } else {
            urlSearchParams.delete('color');
        }
        
        router.push(`${WEBSITE_SHOP}?${urlSearchParams}`);
    };

    const handleSizeFilter = (size) => {
        let newSelectedSize = [...selectedSize];
        
        if (newSelectedSize.includes(size)) {
            newSelectedSize = newSelectedSize.filter(cat => cat !== size);
        } else {
            newSelectedSize.push(size);
        }
        
        setSelectedSize(newSelectedSize);
        
        const urlSearchParams = new URLSearchParams(searchParams.toString());
        
        if (newSelectedSize.length > 0) {
            urlSearchParams.set('size', newSelectedSize.join(','));
        } else {
            urlSearchParams.delete('size');
        }
        
        router.push(`${WEBSITE_SHOP}?${urlSearchParams}`);
    };

    const handleClearAllFilters = () => {
        setSelectedCategory([]);
        setSelectedColor([]);
        setSelectedSize([]);
        
        const urlSearchParams = new URLSearchParams(searchParams.toString());
        urlSearchParams.delete('category');
        urlSearchParams.delete('color');
        urlSearchParams.delete('size');
        
        router.push(`${WEBSITE_SHOP}?${urlSearchParams}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Filter Products</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleClearAllFilters}>
                    Clear All
                </Button>
            </div>

            <Accordion type="multiple" defaultValue={['1', '2', '3']}>
                <AccordionItem value="1">
                    <AccordionTrigger className="uppercase font-semibold hover:no-underline">
                        Category
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className='max-h-48 overflow-auto'>
                            {categoryData?.data && Array.isArray(categoryData.data) && categoryData.data.map((category) => (
                                <div key={category._id} className="flex items-center space-x-2 mb-2">
                                    <Checkbox
                                        id={`category-${category._id}`}
                                        checked={selectedCategory.includes(category.slug)}
                                        onCheckedChange={() => handleCategoryFilter(category.slug)}
                                    />
                                    <label
                                        htmlFor={`category-${category._id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                    >
                                        {category.name} ({category.totalProducts || 0})
                                    </label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="2">
                    <AccordionTrigger className="uppercase font-semibold hover:no-underline">
                        Color
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className='max-h-48 overflow-auto'>
                            {colorData?.data && Array.isArray(colorData.data) && colorData.data.map((color) => (
                                <div key={color} className="flex items-center space-x-2 mb-2">
                                    <Checkbox
                                        id={`color-${color}`}
                                        checked={selectedColor.includes(color)}
                                        onCheckedChange={() => handleColorFilter(color)}
                                    />
                                    <label
                                        htmlFor={`color-${color}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                    >
                                        {color}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="3">
                    <AccordionTrigger className="uppercase font-semibold hover:no-underline">
                        Size
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className='max-h-48 overflow-auto'>
                            {sizeData?.data && Array.isArray(sizeData.data) && sizeData.data.map((size) => (
                                <div key={size} className="flex items-center space-x-2 mb-2">
                                    <Checkbox
                                        id={`size-${size}`}
                                        checked={selectedSize.includes(size)}
                                        onCheckedChange={() => handleSizeFilter(size)}
                                    />
                                    <label
                                        htmlFor={`size-${size}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                    >
                                        {size}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Filter;