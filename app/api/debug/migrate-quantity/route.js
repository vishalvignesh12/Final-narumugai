import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function POST(request) {
    try {
        await connectDB()
        
        console.log('Starting database migration for quantity fields...')
        
        // Update all products without quantity fields
        const productUpdateResult = await ProductModel.updateMany(
            { 
                $or: [
                    { quantity: { $exists: false } },
                    { lockedQuantity: { $exists: false } }
                ]
            },
            {
                $set: {
                    quantity: 10, // Default stock quantity
                    lockedQuantity: 0
                }
            }
        )
        
        console.log(`Updated ${productUpdateResult.modifiedCount} products with quantity fields`)
        
        // Update all product variants without quantity fields
        const variantUpdateResult = await ProductVariantModel.updateMany(
            { 
                $or: [
                    { quantity: { $exists: false } },
                    { lockedQuantity: { $exists: false } }
                ]
            },
            {
                $set: {
                    quantity: 10, // Default stock quantity
                    lockedQuantity: 0
                }
            }
        )
        
        console.log(`Updated ${variantUpdateResult.modifiedCount} product variants with quantity fields`)
        
        // Get sample of updated data
        const sampleProducts = await ProductModel.find({}, 'name quantity lockedQuantity').limit(5)
        const sampleVariants = await ProductVariantModel.find({}, 'sku quantity lockedQuantity').populate('product', 'name').limit(5)
        
        return response(true, 200, 'Database migration completed successfully', {
            productsUpdated: productUpdateResult.modifiedCount,
            variantsUpdated: variantUpdateResult.modifiedCount,
            sampleProducts,
            sampleVariants
        })
        
    } catch (error) {
        console.error('Migration error:', error)
        return catchError(error)
    }
}