import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ADMIN_MEDIA_EDIT } from '@/routes/AdminPanelRoute';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineEdit } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { LuTrash } from "react-icons/lu";
import { showToast } from '@/lib/showToast';

const Media = ({ media, handleDelete, deleteType, selectedMedia, setSelectedMedia }) => {
    
    // --- FIX 1: Define a safe image source with a fallback ---
    // If secure_url is missing, use the placeholder.
    const imageSrc = (media && media.secure_url) ? media.secure_url : '/assets/images/img-placeholder.webp';

    const handleCheck = () => {
        // Guard against undefined selectedMedia
        const currentSelected = selectedMedia || [];
        
        let newSelectedMedia = []
        if (currentSelected.includes(media._id)) {
            newSelectedMedia = currentSelected.filter(m => m !== media._id)
        } else {
            newSelectedMedia = [...currentSelected, media._id]
        }

        setSelectedMedia(newSelectedMedia)
    }

    const handleCopyLink = async (url) => {
        if (!url) return showToast('error', 'No URL to copy');
        await navigator.clipboard.writeText(url)
        showToast('success', 'Link copied.')
    }

    return (
        <div className='border border-gray-200 dark:border-gray-800 relative group rounded overflow-hidden'>
            <div className='absolute top-2 left-2 z-20'>
                <Checkbox
                    // --- FIX 2: Safe access to includes ---
                    checked={selectedMedia?.includes(media._id) || false}
                    onCheckedChange={handleCheck}
                    className="border-primary cursor-pointer bg-white"
                />
            </div>

            <div className='absolute top-2 right-2 z-20'>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <span className='w-7 h-7 flex items-center justify-center rounded-full bg-black/50 cursor-pointer hover:bg-black/70 transition-colors'>
                            <BsThreeDotsVertical color='#fff' />
                        </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        {deleteType === 'SD' &&
                            <>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href={ADMIN_MEDIA_EDIT(media._id)}>
                                        <MdOutlineEdit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleCopyLink(media.secure_url)}>
                                    <IoIosLink className="mr-2 h-4 w-4" />
                                    Copy Link
                                </DropdownMenuItem>
                            </>
                        }

                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => handleDelete([media._id], deleteType)}>
                            <LuTrash className="mr-2 h-4 w-4" />
                            {deleteType === 'SD' ? 'Move Into Trash' : 'Delete Permanently'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className='w-full h-full absolute z-10 transition-all duration-150 ease-in group-hover:bg-black/10 pointer-events-none'></div>

            <div className="bg-gray-100">
                <Image
                    src={imageSrc} // --- FIX 3: Use the safe source variable ---
                    alt={media?.alt || media?.title || 'Media image'}
                    height={300}
                    width={300}
                    className='object-cover w-full sm:h-[200px] h-[150px]'
                    // unoptimized={true} // Keep this if you are using external images heavily
                    onError={(e) => {
                        // --- FIX 4: Better error handling to prevent infinite loops ---
                        if (e.target.src.indexOf('img-placeholder.webp') === -1) {
                            e.target.src = '/assets/images/img-placeholder.webp';
                        }
                    }}
                />
            </div>
        </div>
    )
}

export default Media