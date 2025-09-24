import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET(request) {
    try {
        await connectDB()
        
        // Get basic product count
        const totalProducts = await ProductModel.countDocuments();
        const nonDeletedProducts = await ProductModel.countDocuments({ deletedAt: null });
        
        // Get basic variant count
        const totalVariants = await ProductVariantModel.countDocuments();
        const nonDeletedVariants = await ProductVariantModel.countDocuments({ deletedAt: null });
        
        // Get first few products
        const sampleProducts = await ProductModel.find({ deletedAt: null }).limit(3).select('name slug media');
        
        // Get first few variants
        const sampleVariants = await ProductVariantModel.find({ deletedAt: null }).limit(3).select('product color size sellingPrice');
        
        console.log('Debug Info:');
        console.log('Total products:', totalProducts);
        console.log('Non-deleted products:', nonDeletedProducts);
        console.log('Total variants:', totalVariants);
        console.log('Non-deleted variants:', nonDeletedVariants);
        console.log('Sample products:', sampleProducts);
        console.log('Sample variants:', sampleVariants);
        
        return response(true, 200, 'Debug data retrieved.', {
            totalProducts,
            nonDeletedProducts,
            totalVariants,
            nonDeletedVariants,
            sampleProducts,
            sampleVariants
        });
        
    } catch (error) {
        console.error('Debug API Error:', error);
        return catchError(error);
    }
}