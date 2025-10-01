// Suppress common external script errors that don't affect functionality
if (typeof window !== 'undefined') {
    // Enhanced error suppression for ad blockers and external scripts
    const originalError = console.error;
    console.error = (...args) => {
        const message = args[0]?.toString() || '';
        const stack = args[1]?.stack || '';
        
        // Skip known external script errors
        const skipErrors = [
            'ERR_BLOCKED_BY_CLIENT',
            'sentry-cdn.com',
            'Expected length, "auto"',
            'razorpay.com',
            'lumberjack.razorpay.com',
            'logo-black.png',
            'attribute width: Expected length',
            'attribute height: Expected length',
            'Error: <svg> attribute width: Expected length',
            'Error: <svg> attribute height: Expected length',
            'Failed to load resource',
            'v2-entry-',
            'checkout-static-next',
            'checkout.js:1',
            'v2-entry-sentry',
            'browser.sentry-cdn.com',
            'bundle.min.js',
            'invalid or missing files',
            'Load failed'
        ];
        
        const shouldSkip = skipErrors.some(skipError => 
            message.includes(skipError) || stack.includes(skipError)
        );
        
        if (!shouldSkip) {
            originalError.apply(console, args);
        }
    };
    
    // Suppress network errors and warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        
        const skipWarnings = [
            'ERR_BLOCKED_BY_CLIENT',
            'logo-black.png',
            'Failed to load resource',
            'sentry-cdn.com',
            'lumberjack.razorpay.com',
            'Expected length, "auto"',
            'attribute width: Expected length',
            'attribute height: Expected length',
            'Error: <svg> attribute width: Expected length',
            'Error: <svg> attribute height: Expected length'
        ];
        
        const shouldSkip = skipWarnings.some(skipWarning => 
            message.includes(skipWarning)
        );
        
        if (!shouldSkip) {
            originalWarn.apply(console, args);
        }
    };
    
    // Suppress info logs from external scripts
    const originalInfo = console.info;
    console.info = (...args) => {
        const message = args[0]?.toString() || '';
        
        const skipInfos = [
            'ERR_BLOCKED_BY_CLIENT',
            'razorpay',
            'sentry'
        ];
        
        const shouldSkip = skipInfos.some(skipInfo => 
            message.toLowerCase().includes(skipInfo.toLowerCase())
        );
        
        if (!shouldSkip) {
            originalInfo.apply(console, args);
        }
    };
    
    // Enhanced resource error handling
    window.addEventListener('error', (event) => {
        const message = event.message || event.error?.message || '';
        const filename = event.filename || '';
        
        const skipResourceErrors = [
            'ERR_BLOCKED_BY_CLIENT',
            'logo-black.png',
            'sentry-cdn.com',
            'Failed to load resource',
            'lumberjack.razorpay.com',
            'checkout.js',
            'v2-entry-sentry'
        ];
        
        const shouldSkip = skipResourceErrors.some(skipError => 
            message.includes(skipError) || filename.includes(skipError)
        );
        
        if (shouldSkip) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);
    
    // Handle unhandled promise rejections from blocked requests
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason?.message || event.reason || '';
        
        const skipRejections = [
            'ERR_BLOCKED_BY_CLIENT',
            'Failed to fetch',
            'sentry-cdn.com',
            'lumberjack.razorpay.com',
            'Load failed'
        ];
        
        const shouldSkip = skipRejections.some(skipRejection => 
            reason.toString().includes(skipRejection)
        );
        
        if (shouldSkip) {
            event.preventDefault();
            return false;
        }
    });
}