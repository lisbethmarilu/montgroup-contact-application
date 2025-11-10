import { z } from 'zod'

export const certificateSchema = z.object({
  petName: z.string().min(1, 'El nombre de la mascota es requerido'),
  species: z.enum(['Canino', 'Felino', 'Ave', 'Roedor', 'Reptil', 'Otro'], {
    required_error: 'La especie es requerida',
  }),
  breed: z.string().min(1, 'La raza es requerida'),
  age: z.string().min(1, 'La edad es requerida'),
  sex: z.enum(['Macho', 'Hembra'], {
    required_error: 'El sexo es requerido',
  }),
  testType: z.string().min(1, 'El tipo de prueba es requerido'),
  testBrand: z.string().min(1, 'La marca de la prueba es requerida'),
  testDate: z.string().min(1, 'La fecha de la prueba es requerida'),
  result: z.enum(['NEGATIVO', 'POSITIVO', 'INDETERMINADO'], {
    required_error: 'El resultado es requerido',
  }),
  vetName: z.string().min(1, 'El nombre del veterinario es requerido'),
  clinicName: z.string().min(1, 'El nombre de la clínica es requerido'),
  district: z.string().min(1, 'El distrito es requerido'),
})

export type CertificateFormData = z.infer<typeof certificateSchema>
