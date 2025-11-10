'use client'

import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Text,
  HStack,
  Spinner,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { FiDownload, FiCopy, FiEye, FiFileText, FiRefreshCw } from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Navbar } from '@/components/Navbar'
import { ResultBadge } from '@/components/ResultBadge'
import { FiltersBar } from '@/components/FiltersBar'
import { supabase } from '@/lib/supabaseClient'
import { exportCertificatesToCSV } from '@/lib/csv'

interface Certificate {
  id: string
  certificate_number: string
  pdf_url: string
  pdf_path?: string
  pet_name: string
  species: string
  breed: string
  age: string
  sex: string
  test_type: string
  test_brand: string
  test_date: string
  result: 'NEGATIVO' | 'POSITIVO' | 'INDETERMINADO'
  vet_name: string
  clinic_name: string
  district: string
  created_at: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const fetchCertificates = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCertificates(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los certificados',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const filterCertificates = useCallback(() => {
    let filtered = [...certificates]

    if (searchQuery) {
      filtered = filtered.filter((cert) =>
        cert.pet_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (resultFilter) {
      filtered = filtered.filter((cert) => cert.result === resultFilter)
    }

    if (speciesFilter) {
      filtered = filtered.filter((cert) => cert.species === speciesFilter)
    }

    setFilteredCertificates(filtered)
  }, [certificates, searchQuery, resultFilter, speciesFilter])

  useEffect(() => {
    if (session?.user?.id) {
      fetchCertificates()
    }
  }, [session, fetchCertificates])

  useEffect(() => {
    filterCertificates()
  }, [filterCertificates])

  const handleCopyNumber = (certificateNumber: string) => {
    navigator.clipboard.writeText(certificateNumber)
    toast({
      title: 'Copiado',
      description: 'Número de certificado copiado al portapapeles',
      status: 'success',
      duration: 2000,
    })
  }

  const handleViewDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    onOpen()
  }

  const handleDownload = async (certificate: Certificate) => {
    try {
      // Use pdf_path if available, otherwise extract path from pdf_url
      const pathToUse = certificate.pdf_path || certificate.pdf_url
      
      // Generate a new signed URL for the PDF
      const response = await fetch(
        `/api/certificates/signed-url?path=${encodeURIComponent(pathToUse)}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate signed URL')
      }

      const { signedUrl } = await response.json()
      window.open(signedUrl, '_blank')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo descargar el PDF',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleExportCSV = () => {
    try {
      exportCertificatesToCSV(filteredCertificates, 'certificados.csv')
      toast({
        title: 'CSV exportado',
        description: `Se exportaron ${filteredCertificates.length} certificado(s)`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar el CSV',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleRegenerate = async (certificate: Certificate) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/certificates/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificateId: certificate.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al regenerar el certificado')
      }

      const result = await response.json()

      toast({
        title: 'Certificado regenerado exitosamente',
        description: `Nuevo certificado: ${result.certificateNumber}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Refresh certificates list
      await fetchCertificates()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Container maxW="6xl" py={10}>
          <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
            <Spinner size="xl" color="brand.500" />
          </Box>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Container maxW="6xl" py={10}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="lg">Mis Certificados</Heading>
            <Button
              leftIcon={<FiFileText />}
              colorScheme="green"
              variant="outline"
              onClick={handleExportCSV}
              isDisabled={filteredCertificates.length === 0}
            >
              Exportar CSV
            </Button>
          </HStack>

          <FiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultFilter={resultFilter}
            onResultFilterChange={setResultFilter}
            speciesFilter={speciesFilter}
            onSpeciesFilterChange={setSpeciesFilter}
          />

          <Card>
            <CardBody p={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>N° Certificado</Th>
                      <Th>Mascota</Th>
                      <Th>Especie</Th>
                      <Th>Resultado</Th>
                      <Th>Fecha Prueba</Th>
                      <Th>Veterinario</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCertificates.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={10}>
                          <Text color="gray.500">No se encontraron certificados</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredCertificates.map((cert) => (
                        <Tr key={cert.id}>
                          <Td fontFamily="mono" fontSize="sm">
                            {cert.certificate_number}
                          </Td>
                          <Td fontWeight="medium">{cert.pet_name}</Td>
                          <Td>{cert.species}</Td>
                          <Td>
                            <ResultBadge result={cert.result} />
                          </Td>
                          <Td>
                            {format(new Date(cert.test_date), 'dd/MM/yyyy', {
                              locale: es,
                            })}
                          </Td>
                          <Td fontSize="sm">{cert.vet_name}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Ver detalles"
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(cert)}
                              />
                              <IconButton
                                aria-label="Descargar PDF"
                                icon={<FiDownload />}
                                size="sm"
                                variant="ghost"
                                colorScheme="brand"
                                onClick={() => handleDownload(cert)}
                              />
                              <IconButton
                                aria-label="Rehacer certificado"
                                icon={<FiRefreshCw />}
                                size="sm"
                                variant="ghost"
                                colorScheme="orange"
                                onClick={() => handleRegenerate(cert)}
                                title="Rehacer certificado con estos datos"
                              />
                              <IconButton
                                aria-label="Copiar número"
                                icon={<FiCopy />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyNumber(cert.certificate_number)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Details Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Detalles del Certificado</DrawerHeader>

          <DrawerBody>
            {selectedCertificate && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    N° Certificado
                  </Text>
                  <Text fontFamily="mono" fontSize="lg" color="brand.500">
                    {selectedCertificate.certificate_number}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    Mascota
                  </Text>
                  <Text fontSize="lg">{selectedCertificate.pet_name}</Text>
                </Box>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      Especie
                    </Text>
                    <Text>{selectedCertificate.species}</Text>
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      Raza
                    </Text>
                    <Text>{selectedCertificate.breed}</Text>
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      Edad
                    </Text>
                    <Text>{selectedCertificate.age}</Text>
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      Sexo
                    </Text>
                    <Text>{selectedCertificate.sex}</Text>
                  </Box>
                </HStack>

                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    Tipo de Prueba
                  </Text>
                  <Text>{selectedCertificate.test_type}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    Marca del Test
                  </Text>
                  <Text>{selectedCertificate.test_brand}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    Fecha de la Prueba
                  </Text>
                  <Text>
                    {format(new Date(selectedCertificate.test_date), "dd 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    Resultado
                  </Text>
                  <ResultBadge result={selectedCertificate.result} />
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    Veterinario
                  </Text>
                  <Text>{selectedCertificate.vet_name}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    Clínica
                  </Text>
                  <Text>{selectedCertificate.clinic_name}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                    Distrito
                  </Text>
                  <Text>{selectedCertificate.district}</Text>
                </Box>

                <Button
                  colorScheme="brand"
                  leftIcon={<FiDownload />}
                  onClick={() => handleDownload(selectedCertificate)}
                  mt={4}
                >
                  Descargar PDF
                </Button>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
