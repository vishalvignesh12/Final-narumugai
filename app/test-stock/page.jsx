// Simple test to verify atomic stock purchase API
// Navigate to: http://localhost:3000/api/stock/atomic-purchase

export default function StockTestPage() {
    const testStockPurchase = async () => {
        try {
            const response = await fetch('/api/stock/atomic-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [
                        {
                            variantId: 'test-variant-id', // Replace with actual variant ID
                            quantity: 1
                        }
                    ]
                })
            });

            const data = await response.json();
            console.log('API Response:', data);
            alert(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Test failed:', error);
            alert('Test failed: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Stock Purchase API Test</h1>
            <button 
                onClick={testStockPurchase}
                style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Test Stock Purchase API
            </button>
            <p>Open browser console to see detailed logs</p>
        </div>
    );
}