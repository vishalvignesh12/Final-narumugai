import GlobalProvider from "@/components/Application/GlobalProvider";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import { getMetadataBaseURL } from '@/lib/config';
import AutoCookieGuardian from '@/components/Application/AutoCookieGuardian';
import '@/lib/errorSuppression'; 
// --- 1. IMPORT THEME PROVIDER ---
import ThemeProvider from '@/components/Application/Admin/ThemeProvider';

// --- (metadata object is fine, no changes) ---
export const metadata = {
  // ...
};

export default function RootLayout({ children }) {
  return (
    // --- 2. ADD suppressHydrationWarning TO <html> ---
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* ... (all your head tags are fine) ... */}
      </head>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning={true}
      >
        {/* --- 3. WRAP EVERYTHING IN THEME PROVIDER --- */}
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
          <GlobalProvider>
            <AutoCookieGuardian />
            <ToastContainer />
            {children}
          </GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
