// Example usage of atomic stock purchase functions

import { atomicStockPurchase, buyOneItem } from '../lib/atomicStockPurchase.js';
import { connectDB } from '../lib/databaseConnection.js';

// Example 1: Buy one item (simple case)
async function example1() {
    await connectDB();
    
    const variantId = '507f1f77bcf86cd799439011'; // Replace with actual variant ID
    
    const result = await buyOneItem(variantId);
    
    if (result.success) {
        console.log(`✅ Purchase successful!`);
        console.log(`Product: ${result.productName}`);
        console.log(`Remaining stock: ${result.remainingStock}`);
    } else {
        console.log(`❌ Purchase failed: ${result.error}`);
    }
}

// Example 2: Buy multiple quantities with transaction
async function example2() {
    await connectDB();
    
    const ProductVariantModel = (await import('../models/ProductVariant.model.js')).default;
    const session = await ProductVariantModel.startSession();
    
    try {
        session.startTransaction();
        
        const variantId = '507f1f77bcf86cd799439011'; // Replace with actual variant ID
        const quantity = 2;
        
        const result = await atomicStockPurchase(variantId, quantity, session);
        
        if (result.success) {
            // Proceed with order creation, payment processing, etc.
            console.log(`✅ Stock secured for ${quantity} items`);
            console.log(`Product: ${result.productName}`);
            console.log(`Remaining: ${result.remainingStock}`);
            
            await session.commitTransaction();
        } else {
            console.log(`❌ Stock acquisition failed: ${result.error}`);
            await session.abortTransaction();
        }
        
    } catch (error) {
        await session.abortTransaction();
        console.error('Transaction failed:', error.message);
    } finally {
        session.endSession();
    }
}

// Example 3: Concurrent purchase simulation
async function simulateConcurrentPurchases() {
    await connectDB();
    
    const variantId = '507f1f77bcf86cd799439011'; // Product with only 1 in stock
    
    // Simulate 3 customers trying to buy the same item simultaneously
    const customers = ['Customer A', 'Customer B', 'Customer C'];
    
    const purchasePromises = customers.map(async (customer) => {
        const result = await buyOneItem(variantId);
        
        if (result.success) {
            console.log(`✅ ${customer} successfully purchased ${result.productName}`);
            return { customer, success: true, result };
        } else {
            console.log(`❌ ${customer} failed: ${result.error}`);
            return { customer, success: false, error: result.error };
        }
    });
    
    // Wait for all purchases to complete
    const results = await Promise.all(purchasePromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n📊 Results:`);
    console.log(`Successful purchases: ${successful.length}`);
    console.log(`Failed purchases: ${failed.length}`);
    
    // Only one should succeed when stock is 1
    if (successful.length === 1) {
        console.log(`✅ Atomic operation worked! Only one customer got the item.`);
    } else {
        console.log(`❌ Race condition detected! Multiple customers got the item.`);
    }
}

// Export for testing
export { example1, example2, simulateConcurrentPurchases };