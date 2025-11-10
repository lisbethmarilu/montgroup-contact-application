'use client'

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
} from '@chakra-ui/react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { FiChevronDown, FiLogOut, FiGrid, FiUsers } from 'react-icons/fi'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
      <Container maxW="6xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          <Link href="/">
            <Heading size="md" color="#3A3A3A" cursor="pointer">
              Certificados Veterinarios
            </Heading>
          </Link>

          <HStack spacing={4}>
            {session ? (
              <>
                <Button
                  as={Link}
                  href="/dashboard"
                  variant="ghost"
                  leftIcon={<FiGrid />}
                >
                  Dashboard
                </Button>
                <Button
                  as={Link}
                  href="/contacts"
                  variant="ghost"
                  leftIcon={<FiUsers />}
                >
                  Contactos
                </Button>

                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    rightIcon={<FiChevronDown />}
                  >
                    <HStack spacing={2}>
                      <Avatar
                        size="sm"
                        name={session.user?.name || ''}
                        src={session.user?.image || ''}
                      />
                      <Text display={{ base: 'none', md: 'block' }}>
                        {session.user?.name}
                      </Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      icon={<FiLogOut />}
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      Cerrar sesión
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <Button as={Link} href="/login" colorScheme="brand">
                Iniciar Sesión
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
