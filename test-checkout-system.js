// First-to-Pay-Wins Checkout System Test Script
// This tests the simplified system where stock locking only happens at payment time
// Run this in the browser console to test the system

const BASE_URL = window.location.origin;

// Test configuration
const TEST_CONFIG = {
    // Replace with actual variant IDs from your database
    testVariantId: '64a1b2c3d4e5f6789abc123d', // Update this with a real variant ID
    testQuantity: 1,
    simulateUsers: 3 // Number of concurrent users to simulate
};

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return await response.json();
}

// Test 1: Stock Locking Test
async function testStockLocking() {
    console.log('🔒 Testing Stock Locking...');
    
    const lockRequest = {
        items: [{
            variantId: TEST_CONFIG.testVariantId,
            quantity: TEST_CONFIG.testQuantity
        }]
    };
    
    try {
        const result = await apiRequest('/api/stock/lock', 'POST', lockRequest);
        console.log('Lock Result:', result);
        
        if (result.success) {
            console.log('✅ Stock locked successfully');
            console.log('🕐 Lock expires at:', result.data.lockExpiry);
            
            // Test unlocking
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            
            const unlockResult = await apiRequest('/api/stock/unlock', 'POST', lockRequest);
            console.log('Unlock Result:', unlockResult);
            
            if (unlockResult.success) {
                console.log('✅ Stock unlocked successfully');
            } else {
                console.log('❌ Failed to unlock stock:', unlockResult.message);
            }
        } else {
            console.log('❌ Failed to lock stock:', result.message);
        }
    } catch (error) {
        console.error('❌ Stock locking test error:', error);
    }
}

// Test 2: Concurrent Stock Locking Test
async function testConcurrentStockLocking() {
    console.log('⚡ Testing Concurrent Stock Locking...');
    
    const lockRequest = {
        items: [{
            variantId: TEST_CONFIG.testVariantId,
            quantity: TEST_CONFIG.testQuantity
        }]
    };
    
    // Create multiple concurrent requests
    const promises = Array(TEST_CONFIG.simulateUsers).fill().map((_, index) => {
        return apiRequest('/api/stock/lock', 'POST', lockRequest)
            .then(result => ({ user: index + 1, result }))
            .catch(error => ({ user: index + 1, error: error.message }));
    });
    
    try {
        const results = await Promise.all(promises);
        
        console.log('Concurrent lock results:');
        results.forEach(({ user, result, error }) => {
            if (error) {
                console.log(`❌ User ${user}: Error - ${error}`);
            } else if (result.success) {
                console.log(`✅ User ${user}: Successfully locked stock`);
            } else {
                console.log(`❌ User ${user}: Failed - ${result.message}`);
            }
        });
        
        const successfulLocks = results.filter(r => r.result && r.result.success);
        console.log(`📊 ${successfulLocks.length} out of ${TEST_CONFIG.simulateUsers} users got the stock`);
        
        if (successfulLocks.length === 1) {
            console.log('✅ First-come-first-serve working correctly!');
        } else if (successfulLocks.length > 1) {
            console.log('⚠️ Multiple users got the same stock - race condition detected!');
        } else {
            console.log('❌ No users got the stock - check product availability');
        }
        
        // Unlock any successful locks
        for (const lock of successfulLocks) {
            await apiRequest('/api/stock/unlock', 'POST', lockRequest);
        }
        
    } catch (error) {
        console.error('❌ Concurrent locking test error:', error);
    }
}

// Test 3: Simplified Payment-Time Stock Check
async function testPaymentTimeStockCheck() {
    console.log('💳 Testing Payment-Time Stock Check...');
    
    // Simulate what happens in the payment success handler
    const stockLockItems = [{
        variantId: TEST_CONFIG.testVariantId,
        quantity: TEST_CONFIG.testQuantity
    }];
    
    try {
        console.log('Simulating payment success...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate payment delay
        
        console.log('Attempting to lock stock after payment...');
        const result = await apiRequest('/api/stock/lock', 'POST', {
            items: stockLockItems
        });
        
        if (result.success) {
            console.log('✅ Stock locked successfully after payment');
            console.log('🎉 Order would be completed');
            
            // Cleanup - unlock the stock
            await apiRequest('/api/stock/unlock', 'POST', {
                items: stockLockItems
            });
        } else {
            console.log('❌ Stock locking failed:', result.message);
            console.log('💰 Payment succeeded but product sold out - refund scenario');
        }
    } catch (error) {
        console.error('❌ Payment-time stock check error:', error);
    }
}

// Test 4: Complete First-to-Pay-Wins Flow Simulation
async function testFirstToPayWinsFlow() {
    console.log('🎯 Testing Complete First-to-Pay-Wins Flow...');
    
    const stockItems = {
        items: [{
            variantId: TEST_CONFIG.testVariantId,
            quantity: TEST_CONFIG.testQuantity
        }]
    };
    
    try {
        console.log('Step 1: User proceeds to payment (no pre-stock check)...');
        console.log('✅ Payment gateway opened');
        
        console.log('Step 2: User completes payment...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate payment time
        console.log('✅ Payment successful');
        
        console.log('Step 3: Attempting to lock stock after payment...');
        const lockResult = await apiRequest('/api/stock/lock', 'POST', stockItems);
        
        if (lockResult.success) {
            console.log('✅ Stock locked successfully - User gets the product!');
            console.log('🎉 Order completed successfully');
            
            // Cleanup
            await apiRequest('/api/stock/unlock', 'POST', stockItems);
        } else {
            console.log('❌ Stock locking failed:', lockResult.message);
            console.log('💔 Customer paid but product sold out to someone else');
            console.log('💰 Refund process would be initiated');
        }
        
    } catch (error) {
        console.error('❌ First-to-pay-wins flow test error:', error);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🎯 Starting First-to-Pay-Wins Checkout System Tests');
    console.log('================================================');
    
    console.log('⚠️ IMPORTANT: Update TEST_CONFIG.testVariantId with a real variant ID from your database');
    console.log('System: Stock locking only happens AFTER payment success');
    console.log('');
    
    await testStockLocking();
    console.log('');
    
    await testConcurrentStockLocking();
    console.log('');
    
    await testPaymentTimeStockCheck();
    console.log('');
    
    await testFirstToPayWinsFlow();
    
    console.log('');
    console.log('🏁 All tests completed!');
    console.log('================================================');
}

// Export functions for manual testing
window.checkoutTests = {
    runAllTests,
    testStockLocking,
    testConcurrentStockLocking,
    testPaymentTimeStockCheck,
    testFirstToPayWinsFlow,
    TEST_CONFIG
};

console.log('🧪 First-to-Pay-Wins Test Functions Loaded!');
console.log('Run: checkoutTests.runAllTests() to start all tests');
console.log('Key principle: Stock locking only happens AFTER payment success');
console.log('Configure test settings in: checkoutTests.TEST_CONFIG');