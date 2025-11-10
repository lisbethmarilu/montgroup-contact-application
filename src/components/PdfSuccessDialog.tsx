'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useClipboard,
  HStack,
} from '@chakra-ui/react'
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi'

interface PdfSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  certificateNumber: string
  downloadUrl: string
}

export function PdfSuccessDialog({
  isOpen,
  onClose,
  certificateNumber,
  downloadUrl,
}: PdfSuccessDialogProps) {
  const { hasCopied, onCopy } = useClipboard(certificateNumber)

  const handleDownload = () => {
    window.open(downloadUrl, '_blank')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Certificado Generado Exitosamente</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="auto"
              py={4}
              rounded="md"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                PDF Generado
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Tu certificado ha sido generado y está listo para descargar.
              </AlertDescription>
            </Alert>

            <VStack spacing={2} align="stretch">
              <Text fontWeight="semibold">Número de Certificado:</Text>
              <HStack>
                <Text
                  fontSize="lg"
                  fontFamily="mono"
                  color="blue.600"
                  fontWeight="bold"
                  flex={1}
                >
                  {certificateNumber}
                </Text>
                <Button
                  size="sm"
                  leftIcon={hasCopied ? <FiCheck /> : <FiCopy />}
                  onClick={onCopy}
                  colorScheme={hasCopied ? 'green' : 'gray'}
                >
                  {hasCopied ? 'Copiado' : 'Copiar'}
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cerrar
          </Button>
          <Button
            colorScheme="brand"
            leftIcon={<FiDownload />}
            onClick={handleDownload}
          >
            Descargar PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
