'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'
import { useEffect, useState } from 'react'

const Filter = ({ onFilterChange }) => {
    // State for price range
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(50000);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);

    // Fetch only price range on mount
    useEffect(() => {
        const fetchPriceData = async () => {
            setIsLoadingPrice(true);
            try {
                // We fetch the global price range
                const { data } = await axios.get(`/api/product/price-range`);
                
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

        fetchPriceData();
    }, []); // Empty dependency array = Runs once on mount (Prevents Loop)

    // Handle slider movement (visual update only)
    const handlePriceChange = (value) => {
        setPriceRange(value);
    };
    
    // Commit change when user releases the slider
    const onPriceCommit = (value) => {
        if(onFilterChange) {
            // Pass an object with the specific filter key
            onFilterChange({ priceFilter: value });
        }
    };

    return (
        <div className='sticky top-5'>
            <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                {/* Price Filter Only */}
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
                                    onValueCommit={onPriceCommit} // <--- FIXED: Changed from onValueChangeCommit
                                />
                                <div className='flex justify-between items-center mt-3 text-sm'>
                                    <span>{priceRange[0].toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                    <span>{priceRange[1].toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            </>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default Filter