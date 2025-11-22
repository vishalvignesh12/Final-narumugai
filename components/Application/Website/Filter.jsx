'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'
import { useEffect, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const Filter = ({ onFilterChange, categorySlug }) => {
    // State for price range
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(50000);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);

    // State for categories
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // Fetch price range and categories on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingPrice(true);
            setIsLoadingCategories(true);
            try {
                // Fetch price range
                const priceRes = await axios.get(`/api/product/price-range`);

                if (priceRes.data.success) {
                    const min = priceRes.data.data.min || 0;
                    const max = priceRes.data.data.max || 50000;
                    setMinPrice(min);
                    setMaxPrice(max);
                    setPriceRange([min, max]);
                }

                // Fetch categories
                const categoryRes = await axios.get('/api/category/get-category');
                if (categoryRes.data.success) {
                    setCategories(categoryRes.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch filter data:", error);
            } finally {
                setIsLoadingPrice(false);
                setIsLoadingCategories(false);
            }
        };

        fetchData();
    }, []);

    // Handle initial category selection from URL slug
    useEffect(() => {
        if (categorySlug && categories.length > 0) {
            let newSelected = [];

            if (categorySlug === 'silk') {
                // Select all categories containing 'silk'
                newSelected = categories
                    .filter(c => c.slug.toLowerCase().includes('silk'))
                    .map(c => c._id);
            } else if (categorySlug === 'cotton') {
                // Select all categories containing 'cotton'
                newSelected = categories
                    .filter(c => c.slug.toLowerCase().includes('cotton'))
                    .map(c => c._id);
            } else if (categorySlug === 'designer') {
                // Select all categories NOT containing 'silk' or 'cotton'
                newSelected = categories
                    .filter(c => !c.slug.toLowerCase().includes('silk') && !c.slug.toLowerCase().includes('cotton'))
                    .map(c => c._id);
            } else {
                // Normal single category behavior
                const matchedCategory = categories.find(c => c.slug === categorySlug);
                if (matchedCategory) {
                    newSelected = [matchedCategory._id];
                }
            }

            if (newSelected.length > 0) {
                setSelectedCategories(newSelected);
                // Trigger filter change immediately
                if (onFilterChange) {
                    onFilterChange({ categoryFilter: newSelected });
                }
            }
        }
    }, [categorySlug, categories]); // Run when slug or categories change

    // Handle slider movement (visual update only)
    const handlePriceChange = (value) => {
        setPriceRange(value);
    };

    // Commit change when user releases the slider
    const onPriceCommit = (value) => {
        if (onFilterChange) {
            onFilterChange({ priceFilter: value });
        }
    };

    // Handle category checkbox change
    const handleCategoryChange = (categoryId, checked) => {
        let newSelected;
        if (checked) {
            newSelected = [...selectedCategories, categoryId];
        } else {
            newSelected = selectedCategories.filter(id => id !== categoryId);
        }

        setSelectedCategories(newSelected);

        if (onFilterChange) {
            onFilterChange({ categoryFilter: newSelected });
        }
    };

    return (
        <div className='sticky top-5'>
            <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                {/* Price Filter */}
                <AccordionItem value="item-1">
                    <AccordionTrigger>Price</AccordionTrigger>
                    <AccordionContent>
                        {isLoadingPrice ? (
                            <Skeleton className="h-8 w-full" />
                        ) : (
                            <>
                                <Slider
                                    defaultValue={[minPrice, maxPrice]}
                                    min={minPrice}
                                    max={maxPrice}
                                    step={100}
                                    value={priceRange}
                                    onValueChange={handlePriceChange}
                                    onValueCommit={onPriceCommit}
                                />
                                <div className='flex justify-between items-center mt-3 text-sm'>
                                    <span>{priceRange[0].toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                    <span>{priceRange[1].toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            </>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* Category Filter */}
                <AccordionItem value="item-2">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                        {isLoadingCategories ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div key={category._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`category-${category._id}`}
                                            checked={selectedCategories.includes(category._id)}
                                            onCheckedChange={(checked) => handleCategoryChange(category._id, checked)}
                                        />
                                        <Label
                                            htmlFor={`category-${category._id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {category.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default Filter