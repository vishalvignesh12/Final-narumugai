'use client'
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
    Dialog, 
    DialogContent, 
    DialogTrigger, 
    DialogTitle, // <--- 1. ADD THIS IMPORT
    DialogHeader // <--- Optional but good for structure
} from '@/components/ui/dialog';
import useWindowSize from '@/hooks/useWindowSize';
import Filter from './Filter';
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute';
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5';

const SearchWithFilters = ({ onFilterChange }) => { // <--- 2. ADD PROP HERE (Important for filtering)
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [isMobile, setIsMobile] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const windowSize = useWindowSize();

    // Initialize isMobile based on window size
    useEffect(() => {
        const checkMobileSize = () => {
            setIsMobile(windowSize?.width < 768);
        };
        
        if (windowSize) {
            checkMobileSize();
        }
    }, [windowSize]);

    // Update search results when search query changes
    const handleSearch = (e) => {
        e.preventDefault();
        const urlSearchParams = new URLSearchParams(searchParams.toString());
        
        if (searchQuery.trim()) {
            urlSearchParams.set('q', searchQuery.trim());
        } else {
            urlSearchParams.delete('q');
        }
        
        router.push(`${WEBSITE_SHOP}?${urlSearchParams.toString()}`);
    };

    return (
        <div className="w-full bg-white border-b shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4">
                {/* Search Bar Section */}
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                    {/* Search Input Container */}
                    <div className="relative flex-1 max-w-2xl">
                        <Input
                            className="h-12 pl-12 pr-4 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                            placeholder="Search for sarees, colors, categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <IoSearchOutline 
                            size={20} 
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                        />
                    </div>

                    {/* Filter Button */}
                    {isMobile ? (
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="h-12 px-4 rounded-lg border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all"
                                >
                                    <IoFilterOutline size={20} className="mr-2" />
                                    <span className="hidden sm:inline">Filters</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl p-0">
                                <div className="p-4 border-b bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg">Filter Products</h3>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setIsFilterOpen(false)}
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </div>
                                <div className="overflow-y-auto p-4">
                                    <Filter onFilterChange={onFilterChange} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    ) : (
                        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="h-12 px-4 rounded-lg border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all"
                                >
                                    <IoFilterOutline size={20} className="mr-2" />
                                    Filters
                                </Button>
                            </DialogTrigger>
                            
                            {/* 3. FIXED DIALOG CONTENT */}
                            <DialogContent className="max-w-md max-h-[80vh] overflow-hidden p-0">
                                <div className="p-4 border-b bg-gray-50">
                                    <DialogHeader>
                                        {/* REPLACED h3 WITH DialogTitle */}
                                        <DialogTitle className="text-left">Filter Products</DialogTitle>
                                    </DialogHeader>
                                </div>
                                <div className="overflow-y-auto p-4">
                                    {/* Passed props correctly */}
                                    <Filter onFilterChange={onFilterChange} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Search Button */}
                    <Button 
                        type="submit" 
                        className="h-12 px-6 rounded-lg bg-pink-500 hover:bg-pink-600 text-white transition-all"
                    >
                        <IoSearchOutline size={18} className="mr-2" />
                        Search
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default SearchWithFilters;