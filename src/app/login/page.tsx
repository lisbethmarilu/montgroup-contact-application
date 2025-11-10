'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  Spinner,
} from '@chakra-ui/react'
import { signIn, useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  useEffect(() => {
    console.log('Login page - Session status:', status, 'Session:', session)
    if (status === 'authenticated' && session) {
      // User is already logged in, redirect to callback URL or dashboard
      console.log('Redirecting to:', callbackUrl)
      // Use window.location for a hard redirect to ensure it works
      window.location.href = callbackUrl
    }
  }, [status, session, callbackUrl])

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  // Show loading spinner while checking session
  if (status === 'loading') {
    return (
      <Box bg="gray.50" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.500" />
      </Box>
    )
  }

  // Don't render login form if user is authenticated (will redirect)
  if (status === 'authenticated') {
    return null
  }

  return (
    <Box bg="gray.50" minH="100vh" display="flex" alignItems="center">
      <Container maxW="md">
        <Card rounded="2xl" shadow="lg">
          <CardBody p={10}>
            <VStack spacing={6}>
              <Heading size="xl" color="#3A3A3A" textAlign="center">
                Certificados Veterinarios
              </Heading>

              <Text textAlign="center" color="gray.600">
                Inicia sesión para acceder al dashboard y gestionar tus certificados
              </Text>

              <Button
                size="lg"
                width="full"
                leftIcon={<Icon as={FcGoogle} boxSize={6} />}
                onClick={handleGoogleSignIn}
                variant="outline"
                _hover={{
                  bg: 'gray.50',
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
                transition="all 0.2s"
              >
                Continuar con Google
              </Button>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
