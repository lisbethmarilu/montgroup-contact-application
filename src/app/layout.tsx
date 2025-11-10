import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Certificados Veterinarios',
  description: 'Sistema de generación de certificados veterinarios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={inter.className} 
        suppressHydrationWarning
        style={{
          backgroundColor: '#f7fafc',
          color: '#2d3748',
          margin: 0,
          padding: 0,
        }}
      >
        {/* Block rendering until styles are loaded */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Initialize color mode before render
                try {
                  var mode = localStorage.getItem('chakra-ui-color-mode');
                  if (!mode) {
                    localStorage.setItem('chakra-ui-color-mode', 'light');
                  }
                } catch (e) {}
                
                // Hide body until styles are ready
                document.documentElement.style.visibility = 'hidden';
                document.documentElement.style.opacity = '0';
              })();
            `,
          }}
        />
        <Providers>{children}</Providers>
        {/* Show content once styles are loaded */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function showContent() {
                  // Check if Chakra UI styles are loaded
                  var emotionStyles = document.querySelectorAll('style[data-emotion]');
                  var hasStyles = emotionStyles.length > 0;
                  
                  if (hasStyles) {
                    document.documentElement.style.visibility = 'visible';
                    document.documentElement.style.opacity = '1';
                    document.documentElement.style.transition = 'opacity 0.2s ease-in';
                  } else {
                    // Check again after a short delay
                    setTimeout(showContent, 50);
                  }
                }
                
                // Start checking after DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', showContent);
                } else {
                  showContent();
                }
                
                // Fallback: show content after 2 seconds regardless
                setTimeout(function() {
                  document.documentElement.style.visibility = 'visible';
                  document.documentElement.style.opacity = '1';
                }, 2000);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
