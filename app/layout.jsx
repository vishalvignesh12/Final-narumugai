import GlobalProvider from "@/components/Application/GlobalProvider";
import "./globals.css";
import { Assistant } from 'next/font/google'
import { ToastContainer } from 'react-toastify';
import { getMetadataBaseURL } from '@/lib/config';
import AutoCookieGuardian from '@/components/Application/AutoCookieGuardian';
import '@/lib/errorSuppression'; 
// --- 1. IMPORT THEME PROVIDER ---
import ThemeProvider from '@/components/Application/Admin/ThemeProvider';

const assistantFont = Assistant({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

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
        className={`${assistantFont.className} antialiased`}
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