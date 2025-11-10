'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'
import { SessionProvider } from 'next-auth/react'
import { StyleLoader } from '@/components/StyleLoader'
import theme from '@/styles/theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CacheProvider>
        <ChakraProvider 
          theme={theme}
          resetCSS={true}
        >
          <StyleLoader>
            {children}
          </StyleLoader>
        </ChakraProvider>
      </CacheProvider>
    </SessionProvider>
  )
}
