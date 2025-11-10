'use client'

import { useEffect, useState } from 'react'
import { Box, Spinner } from '@chakra-ui/react'

export function StyleLoader({ children }: { children: React.ReactNode }) {
  const [stylesLoaded, setStylesLoaded] = useState(false)

  useEffect(() => {
    // Check if Chakra UI styles are loaded by checking for emotion styles
    const checkStylesLoaded = () => {
      // Check for emotion style tags (Chakra UI uses Emotion)
      const emotionStyles = document.querySelectorAll('style[data-emotion]')
      const hasEmotionStyles = emotionStyles.length > 0

      // Also check if body has Chakra UI classes or styles applied
      const bodyStyles = window.getComputedStyle(document.body)
      const hasChakraStyles = bodyStyles.backgroundColor !== '' && bodyStyles.color !== ''

      // Check if color mode script has run
      const colorMode = localStorage.getItem('chakra-ui-color-mode')
      
      // Styles are loaded if we have emotion styles or Chakra styles are applied
      if (hasEmotionStyles || (hasChakraStyles && colorMode)) {
        setStylesLoaded(true)
        return
      }

      // If not loaded yet, check again after a short delay
      setTimeout(checkStylesLoaded, 50)
    }

    // Initial check
    checkStylesLoaded()

    // Fallback: if styles aren't detected after 2 seconds, show content anyway
    const fallbackTimeout = setTimeout(() => {
      setStylesLoaded(true)
    }, 2000)

    return () => clearTimeout(fallbackTimeout)
  }, [])

  if (!stylesLoaded) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        zIndex={9999}
      >
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Box>
    )
  }

  return <>{children}</>
}

