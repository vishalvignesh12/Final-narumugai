'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'
import { useEffect, useState } from 'react'

const Filter = ({ category, colors, sizes, onFilterChange }) => {
    // State for price range
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(50000);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);

    // State for selected filters
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);

    // Fetch price range
    const fetchPriceRange = async () => {
        setIsLoadingPrice(true);
        try {
            // ** FIX: Pass the selected category (if any) to the API **
            const categorySlug = category.length > 0 ? category[0] : '';
            const { data } = await axios.get(`/api/product/price-range?category=${categorySlug}`);
            if (data.success) {
                const min = data.data.min || 0;
                const max = data.data.max || 50000;
                setMinPrice(min);
                setMaxPrice(max);
                setPriceRange([min, max]);
            }
        } catch (error) {
            console.error("Failed to fetch price range:", error);
        } finally {
            setIsLoadingPrice(false);
        }
    };

    // ** FIX: Re-fetch price range when the category changes **
    useEffect(() => {
        fetchPriceRange();
    }, [category]); // Dependency on category

    // Handle price change
    const handlePriceChange = (value) => {
        setPriceRange(value);
    };
    
    // Call onFilterChange when price slider stops sliding
    const onPriceCommit = (value) => {
        onFilterChange('price', value);
    };

    // Handle color change
    const handleColorChange = (color) => {
        const newColors = selectedColors.includes(color)
            ? selectedColors.filter(c => c !== color)
            : [...selectedColors, color];
        setSelectedColors(newColors);
        onFilterChange('color', newColors);
    };

    // Handle size change
    const handleSizeChange = (size) => {
        const newSizes = selectedSizes.includes(size)
            ? selectedSizes.filter(s => s !== size)
            : [...selectedSizes, size];
        setSelectedSizes(newSizes);
        onFilterChange('size', newSizes);
    };

    return (
        <div className='sticky top-5'>
            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
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
                                    onValueChangeCommit={onPriceCommit}
                                />
                                <div className='flex justify-between items-center mt-3'>
                                    <span>{priceRange[0].toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                    <span>{priceRange[1].toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            </>
                        )}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Color</AccordionTrigger>
                    <AccordionContent>
                        <div className='flex flex-wrap gap-3'>
                            {colors.map(color => (
                                <div
                                    key={color}
                                    className={`border rounded-full px-4 py-1 cursor-pointer ${selectedColors.includes(color) ? 'bg-primary text-white' : ''}`}
                                    onClick={() => handleColorChange(color)}
                                >
                                    {color}
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Size</AccordionTrigger>
                    <AccordionContent>
                        <div className='flex flex-wrap gap-3'>
                            {sizes.map(size => (
                                <div
                                    key={size}
                                    className={`border rounded-full px-4 py-1 cursor-pointer ${selectedSizes.includes(size) ? 'bg-primary text-white' : ''}`}
                                    onClick={() => handleSizeChange(size)}
                                >
                                    {size}
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default Filter