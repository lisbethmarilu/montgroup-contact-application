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
      50: '#fef3eb',
      100: '#fde0c7',
      200: '#fbcd9f',
      300: '#f9ba77',
      400: '#f7a74f',
      500: '#ef6603',
      600: '#bf5202',
      700: '#8f3d02',
      800: '#5f2901',
      900: '#2f1401',
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
