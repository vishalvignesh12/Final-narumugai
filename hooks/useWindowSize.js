import { useState, useEffect } from "react";

const useWindowSize = () => {
    // --- FIX: Add mounted state ---
    const [isClient, setIsClient] = useState(false);

    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        // --- FIX: Set mounted state to true ---
        setIsClient(true);

        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        
        window.addEventListener("resize", handleResize);
        
        // Call handler right away so state gets updated with initial window size
        handleResize();
        
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount

    const isMobile = windowSize.width < 768;

    // --- FIX: Return a consistent value until mounted ---
    return { 
        windowSize, 
        // On server-render, isMobile will be false. 
        // On client-render, it will be false *until* mounted,
        // then it re-renders with the correct value.
        // This stops the hydration error.
        isMobile: isClient ? isMobile : false 
    };
}

export default useWindowSize;