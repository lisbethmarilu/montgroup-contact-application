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
  DrawerFooter,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  HStack,
  Spinner,
  Card,
  CardBody,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Text,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { FiEdit, FiTrash2, FiPlus, FiDownload } from 'react-icons/fi'
import { Navbar } from '@/components/Navbar'
import { exportContactsToCSV } from '@/lib/csv'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  district: string
  notes?: string
  owner_id: string
}

interface ContactFormData {
  name: string
  email: string
  phone: string
  district: string
  notes: string
}

const emptyForm: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  district: '',
  notes: '',
}

const steps = [
  { title: 'Información Básica', description: 'Nombre y Email' },
  { title: 'Contacto', description: 'Teléfono y Distrito' },
  { title: 'Notas', description: 'Información adicional' },
]

export default function ContactsPage() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<ContactFormData>(emptyForm)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/contacts')

      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }

      const result = await response.json()
      setContacts(result.data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los contactos',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (session?.user?.id) {
      fetchContacts()
    }
  }, [session?.user?.id, fetchContacts])

  const handleCreate = () => {
    setEditingContact(null)
    setFormData(emptyForm)
    setActiveStep(0)
    onOpen()
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      district: contact.district || '',
      notes: contact.notes || '',
    })
    setActiveStep(0)
    onOpen()
  }

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate step 1: Name is required
      if (!formData.name.trim()) {
        toast({
          title: 'Error',
          description: 'El nombre es requerido',
          status: 'error',
          duration: 3000,
        })
        return
      }
    }
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact)
    onDeleteOpen()
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      setIsSaving(true)

      if (editingContact) {
        // Update existing contact
        const response = await fetch(`/api/contacts/${editingContact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update contact')
        }

        toast({
          title: 'Contacto actualizado',
          status: 'success',
          duration: 2000,
        })
      } else {
        // Create new contact
        const response = await fetch('/api/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create contact')
        }

        toast({
          title: 'Contacto creado',
          status: 'success',
          duration: 2000,
        })
      }

      await fetchContacts()
      setActiveStep(0)
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar el contacto',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!contactToDelete) return

    try {
      const response = await fetch(`/api/contacts/${contactToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete contact')
      }

      toast({
        title: 'Contacto eliminado',
        status: 'success',
        duration: 2000,
      })

      await fetchContacts()
      onDeleteClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el contacto',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleExportCSV = () => {
    if (contacts.length === 0) {
      toast({
        title: 'Sin datos',
        description: 'No hay contactos para exportar',
        status: 'warning',
        duration: 2000,
      })
      return
    }

    exportContactsToCSV(contacts)
    toast({
      title: 'CSV exportado',
      description: `${contacts.length} contactos exportados`,
      status: 'success',
      duration: 2000,
    })
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
          <HStack justify="space-between">
            <Heading size="lg">Mis Contactos</Heading>
            <HStack>
              <Button
                leftIcon={<FiDownload />}
                variant="outline"
                onClick={handleExportCSV}
              >
                Exportar CSV
              </Button>
              <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleCreate}>
                Nuevo Contacto
              </Button>
            </HStack>
          </HStack>

          <Card>
            <CardBody p={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Nombre</Th>
                      <Th>Email</Th>
                      <Th>Teléfono</Th>
                      <Th>Distrito</Th>
                      <Th>Notas</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {contacts.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={10}>
                          <Text color="gray.500">No hay contactos</Text>
                          <Button
                            mt={4}
                            leftIcon={<FiPlus />}
                            colorScheme="brand"
                            variant="ghost"
                            onClick={handleCreate}
                          >
                            Crear tu primer contacto
                          </Button>
                        </Td>
                      </Tr>
                    ) : (
                      contacts.map((contact) => (
                        <Tr key={contact.id}>
                          <Td fontWeight="medium">{contact.name}</Td>
                          <Td>{contact.email || '-'}</Td>
                          <Td>{contact.phone || '-'}</Td>
                          <Td>{contact.district || '-'}</Td>
                          <Td fontSize="sm" color="gray.600" maxW="200px" isTruncated>
                            {contact.notes || '-'}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Editar"
                                icon={<FiEdit />}
                                size="sm"
                                variant="ghost"
                                colorScheme="brand"
                                onClick={() => handleEdit(contact)}
                              />
                              <IconButton
                                aria-label="Eliminar"
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteClick(contact)}
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

      {/* Create/Edit Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={6} align="stretch">
              {/* Stepper */}
              <Stepper index={activeStep} colorScheme="brand" size="sm">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0">
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>

              {/* Step Content */}
              <Box minH="300px">
                {activeStep === 0 && (
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Nombre</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Nombre completo"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="correo@ejemplo.com"
                      />
                    </FormControl>
                  </VStack>
                )}

                {activeStep === 1 && (
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Teléfono</FormLabel>
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+51 999 999 999"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Distrito</FormLabel>
                      <Input
                        value={formData.district}
                        onChange={(e) =>
                          setFormData({ ...formData, district: e.target.value })
                        }
                        placeholder="Lima, Miraflores"
                      />
                    </FormControl>
                  </VStack>
                )}

                {activeStep === 2 && (
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Notas</FormLabel>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Notas adicionales..."
                        rows={6}
                      />
                    </FormControl>
                  </VStack>
                )}
              </Box>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            {activeStep > 0 && (
              <Button variant="outline" mr={3} onClick={handlePrevious}>
                Anterior
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button colorScheme="brand" onClick={handleNext}>
                Siguiente
              </Button>
            ) : (
              <Button
                colorScheme="brand"
                onClick={handleSave}
                isLoading={isSaving}
              >
                {editingContact ? 'Guardar' : 'Crear'}
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Contacto
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro de eliminar a <strong>{contactToDelete?.name}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
