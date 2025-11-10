'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  useToast,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  useSteps,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { certificateSchema, type CertificateFormData } from '@/lib/validations/certificate'
import { PdfSuccessDialog } from './PdfSuccessDialog'

const testTypes = [
  'Parvovirus',
  'Moquillo',
  'Rabia',
  'Leishmania',
  'Filaria',
  'Coronavirus',
  'Giardia',
  'Otro',
]

const steps = [
  { title: 'Datos del Paciente', description: 'Información de la mascota' },
  { title: 'Datos de la Prueba', description: 'Información del examen' },
  { title: 'Veterinaria Responsable', description: 'Datos del veterinario' },
]

export function CertificateForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [generatedCertificate, setGeneratedCertificate] = useState<{
    certificateNumber: string
    downloadUrl: string
  } | null>(null)
  const toast = useToast()

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  // Stepper orientation - always horizontal
  const stepperOrientation: 'horizontal' = 'horizontal'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    mode: 'onSubmit', // Only validate on submit
    reValidateMode: 'onSubmit', // Only re-validate on submit
  })

  const onSubmit = async (data: CertificateFormData) => {
    // Show errors when user tries to submit
    setShowErrors(true)
    
    // Validate all fields before submitting
    const isValid = await trigger()
    
    if (!isValid) {
      // If validation fails, scroll to first error after a short delay
      setTimeout(() => {
        const firstErrorField = Object.keys(errors)[0]
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`)
          if (element) {
            ;(element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }, 100)
      return
    }
    
    // If validation passes, proceed with submission
    setShowErrors(false)

    setIsLoading(true)
    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al generar el certificado')
      }

      const result = await response.json()
      setGeneratedCertificate({
        certificateNumber: result.certificateNumber,
        downloadUrl: result.downloadUrl,
      })

      toast({
        title: 'Certificado generado exitosamente',
        description: `N° ${result.certificateNumber}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
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

  const handleCloseDialog = () => {
    setGeneratedCertificate(null)
    setShowErrors(false)
    reset()
    setActiveStep(0)
  }

  const handleNext = async () => {
    let fieldsToValidate: (keyof CertificateFormData)[] = []

    if (activeStep === 0) {
      // Validate step 1: Patient Data
      fieldsToValidate = ['petName', 'species', 'breed', 'age', 'sex']
    } else if (activeStep === 1) {
      // Validate step 2: Test Data
      fieldsToValidate = ['testType', 'testBrand', 'testDate', 'result']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid && activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  return (
    <>
      <Container maxW="6xl" py={10}>
        <Card rounded="2xl" shadow="md">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="xl" textAlign="center" color="#3A3A3A">
                Generar Certificado Veterinario
              </Heading>

              <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <VStack spacing={6} align="stretch">
                  {/* Stepper */}
                  <Box>
                    {/* Mobile: Show current step title */}
                    <Box display={{ base: 'block', md: 'none' }} mb={4}>
                      <Heading size="sm" color="brand.500" textAlign="center">
                        {steps[activeStep].title}
                      </Heading>
                      <Text fontSize="sm" color="gray.600" textAlign="center" mt={1}>
                        Paso {activeStep + 1} de {steps.length}
                      </Text>
                    </Box>

                    {/* Stepper */}
                    <Stepper 
                      index={activeStep} 
                      colorScheme="brand" 
                      size={{ base: 'sm', md: 'md' }}
                      orientation={stepperOrientation}
                    >
                      {steps.map((step, index) => (
                        <Step key={index}>
                          <StepIndicator>
                            <StepStatus
                              complete={<StepIcon />}
                              incomplete={<StepNumber />}
                              active={<StepNumber />}
                            />
                          </StepIndicator>
                          <Box flexShrink="0" display={{ base: 'none', md: 'block' }}>
                            <StepTitle>{step.title}</StepTitle>
                            <StepDescription display={{ base: 'none', lg: 'block' }}>
                              {step.description}
                            </StepDescription>
                          </Box>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  {/* Step Content */}
                  <Box minH={{ base: '300px', md: '400px' }} py={4}>
                    {activeStep === 0 && (
                      <Box>
                        <Heading size="md" mb={4}>
                          Datos del Paciente
                        </Heading>
                        <Divider mb={4} />
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl isInvalid={!!errors.petName}>
                            <FormLabel>Nombre de la Mascota</FormLabel>
                            <Input {...register('petName')} placeholder="Ej: Max" autoComplete="off" />
                            <FormErrorMessage>{errors.petName?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!errors.species}>
                            <FormLabel>Especie</FormLabel>
                            <Select {...register('species')} placeholder="Seleccionar" autoComplete="off">
                              <option value="Canino">Canino</option>
                              <option value="Felino">Felino</option>
                              <option value="Ave">Ave</option>
                              <option value="Roedor">Roedor</option>
                              <option value="Reptil">Reptil</option>
                              <option value="Otro">Otro</option>
                            </Select>
                            <FormErrorMessage>{errors.species?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!errors.breed}>
                            <FormLabel>Raza</FormLabel>
                            <Input {...register('breed')} placeholder="Ej: Labrador" autoComplete="off" />
                            <FormErrorMessage>{errors.breed?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!errors.age}>
                            <FormLabel>Edad</FormLabel>
                            <Input {...register('age')} placeholder="Ej: 2 años" autoComplete="off" />
                            <FormErrorMessage>{errors.age?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!errors.sex}>
                            <FormLabel>Sexo</FormLabel>
                            <Select {...register('sex')} placeholder="Seleccionar" autoComplete="off">
                              <option value="Macho">Macho</option>
                              <option value="Hembra">Hembra</option>
                            </Select>
                            <FormErrorMessage>{errors.sex?.message}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>
                      </Box>
                    )}

                    {activeStep === 1 && (
                      <Box>
                        <Heading size="md" mb={4}>
                          Datos de la Prueba
                        </Heading>
                        <Divider mb={4} />
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl isInvalid={!!errors.testType}>
                            <FormLabel>Tipo de Prueba</FormLabel>
                            <Select {...register('testType')} placeholder="Seleccionar" autoComplete="off">
                              {testTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </Select>
                            <FormErrorMessage>{errors.testType?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!errors.testBrand}>
                            <FormLabel>Marca del Test</FormLabel>
                            <Input {...register('testBrand')} placeholder="Ej: BioVet" autoComplete="off" />
                            <FormErrorMessage>{errors.testBrand?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!errors.testDate}>
                            <FormLabel>Fecha de la Prueba</FormLabel>
                            <Input {...register('testDate')} type="date" autoComplete="off" />
                            <FormErrorMessage>{errors.testDate?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!errors.result}>
                            <FormLabel>Resultado</FormLabel>
                            <Select {...register('result')} placeholder="Seleccionar" autoComplete="off">
                              <option value="NEGATIVO">NEGATIVO</option>
                              <option value="POSITIVO">POSITIVO</option>
                              <option value="INDETERMINADO">INDETERMINADO</option>
                            </Select>
                            <FormErrorMessage>{errors.result?.message}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>
                      </Box>
                    )}

                    {activeStep === 2 && (
                      <Box>
                        <Heading size="md" mb={4}>
                          Veterinaria Responsable
                        </Heading>
                        <Divider mb={4} />
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl isInvalid={showErrors && !!errors.vetName}>
                            <FormLabel>Nombre del Veterinario</FormLabel>
                            <Input {...register('vetName')} placeholder="Dr./Dra. Nombre Completo" autoComplete="off" />
                            <FormErrorMessage>{showErrors && errors.vetName?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={showErrors && !!errors.clinicName}>
                            <FormLabel>Nombre de la Clínica</FormLabel>
                            <Input {...register('clinicName')} placeholder="Clínica Veterinaria" autoComplete="off" />
                            <FormErrorMessage>{showErrors && errors.clinicName?.message}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={showErrors && !!errors.district}>
                            <FormLabel>Distrito</FormLabel>
                            <Input {...register('district')} placeholder="Lima, Miraflores" autoComplete="off" />
                            <FormErrorMessage>{showErrors && errors.district?.message}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>
                      </Box>
                    )}
                  </Box>

                  {/* Navigation Buttons */}
                  <HStack 
                    spacing={4} 
                    justify="flex-end" 
                    mt={4}
                    flexDirection={{ base: 'column', md: 'row' }}
                    width="full"
                  >
                    {activeStep > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={handlePrevious} 
                        size={{ base: 'md', md: 'lg' }}
                        width={{ base: 'full', md: 'auto' }}
                      >
                        Anterior
                      </Button>
                    )}
                           {activeStep < steps.length - 1 ? (
                             <Button 
                               colorScheme="brand" 
                               onClick={handleNext} 
                               size={{ base: 'md', md: 'lg' }}
                               width={{ base: 'full', md: 'auto' }}
                             >
                               Siguiente
                             </Button>
                           ) : (
                             <Button
                               type="submit"
                               colorScheme="brand"
                               size={{ base: 'md', md: 'lg' }}
                               isLoading={isLoading}
                               loadingText="Generando..."
                               width={{ base: 'full', md: 'auto' }}
                             >
                               Generar Certificado PDF
                             </Button>
                           )}
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Container>

      {generatedCertificate && (
        <PdfSuccessDialog
          isOpen={!!generatedCertificate}
          onClose={handleCloseDialog}
          certificateNumber={generatedCertificate.certificateNumber}
          downloadUrl={generatedCertificate.downloadUrl}
        />
      )}
    </>
  )
}
