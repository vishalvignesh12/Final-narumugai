'use client'
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/showToast';
import axios from 'axios';
import { CldUploadWidget } from 'next-cloudinary';
import { FiPlus } from "react-icons/fi";

const UploadMedia = ({ isMultiple, queryClient }) => {

    const handleOnError = (error) => {
        const errorMessage = error?.statusText || error?.message || "Upload Error";
        showToast('error', errorMessage);
    }
    
    const handleOnQueueEnd = async (results) => {
        // Safety check: ensure files exist
        if (!results?.info?.files) return;

        const files = results.info.files;
        const uploadedFiles = files.filter(file => file.uploadInfo).map(file => ({
            asset_id: file.uploadInfo.asset_id,
            public_id: file.uploadInfo.public_id,
            secure_url: file.uploadInfo.secure_url,
            path: file.uploadInfo.path,
            thumbnail_url: file.uploadInfo.thumbnail_url,
        }))

        if (uploadedFiles.length > 0) {
            try {
                const { data: mediaUploadResponse } = await axios.post('/api/media/create', uploadedFiles)
                if (!mediaUploadResponse.success) {
                    throw new Error(mediaUploadResponse.message)
                }

                // Refresh the media list
                if (queryClient) {
                    queryClient.invalidateQueries(['media-page'])
                }
                showToast('success', mediaUploadResponse.message)

            } catch (error) {
                showToast('error', error.message)
            }
        }
    }

    return (
        <CldUploadWidget
            // FIX 1: Removed signatureEndpoint to fix 401 Unauthorized error
            // signatureEndpoint="/api/cloudinary-signature" 
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onError={handleOnError}
            onQueuesEnd={handleOnQueueEnd}
            options={{
                multiple: isMultiple,
                sources: ['local', 'url', 'unsplash', 'google_drive'],
            }}
        >
            {/* FIX 2: Destructure isLoading and widget to prevent crash */}
            {(widgetProps) => {
                const { open, isLoading, widget } = widgetProps || {};
                
                return (
                    <Button 
                        type="button" 
                        // Check if widget is ready before clicking
                        onClick={() => {
                            if (open && widget && !isLoading) {
                                open();
                            }
                        }}
                        // Disable button while loading or if widget/open is missing
                        disabled={isLoading || !widget || !open} 
                    >
                        <FiPlus className="mr-2" />
                        {isLoading ? 'Loading...' : 'Upload Media'}
                    </Button>
                );
            }}

        </CldUploadWidget>
    )
}

export default UploadMedia