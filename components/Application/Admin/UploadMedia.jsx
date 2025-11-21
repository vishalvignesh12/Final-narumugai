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
        if (!results?.info?.files) return;

        const files = results.info.files;
        // Create array of files
        const uploadedFiles = files.filter(file => file.uploadInfo).map(file => ({
            asset_id: file.uploadInfo.asset_id,
            public_id: file.uploadInfo.public_id,
            secure_url: file.uploadInfo.secure_url,
            path: file.uploadInfo.path,
            thumbnail_url: file.uploadInfo.thumbnail_url,
            alt: file.uploadInfo.original_filename || "", // Add default alt
            title: file.uploadInfo.original_filename || "", // Add default title
        }))

        if (uploadedFiles.length > 0) {
            try {
                // Ensure we are sending the array
                const { data: mediaUploadResponse } = await axios.post('/api/media/create', uploadedFiles)

                if (!mediaUploadResponse.success) {
                    throw new Error(mediaUploadResponse.message)
                }

                // FIX: Refresh BOTH the main page list and the modal list
                if (queryClient) {
                    queryClient.invalidateQueries(['media-page']) // For Admin Media Page
                    queryClient.invalidateQueries(['MediaModal']) // For Product Add/Edit Modal
                }
                showToast('success', mediaUploadResponse.message)

            } catch (error) {
                console.error("Upload Save Error:", error);
                showToast('error', error.message || "Failed to save media")
            }
        }
    }

    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onError={handleOnError}
            onQueuesEnd={handleOnQueueEnd}
            options={{
                multiple: isMultiple,
                sources: ['local', 'url', 'unsplash', 'google_drive'],
            }}
        >
            {(widgetProps) => {
                const { open, isLoading, widget } = widgetProps || {};
                return (
                    <Button
                        type="button"
                        onClick={() => {
                            if (open && widget && !isLoading) open();
                        }}
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