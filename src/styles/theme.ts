import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
  },
  colors: {
    brand: {
      50: '#e8ecf4',
      100: '#c5d1e3',
      200: '#9fb0d0',
      300: '#788fbd',
      400: '#5a76ae',
      500: '#4269B0', // Primary color
      600: '#3a5a9d',
      700: '#314a88',
      800: '#283a73',
      900: '#1a2254',
    },
    secondary: {
      50: '#fde8e4',
      100: '#fbc4ba',
      200: '#f89c8d',
      300: '#f5745f',
      400: '#f3563c',
      500: '#C74026', // Secondary color
      600: '#b63820',
      700: '#a02e1a',
      800: '#8a2414',
      900: '#64160a',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          boxShadow: 'md',
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        color: '#3A3A3A',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
})

export default theme
