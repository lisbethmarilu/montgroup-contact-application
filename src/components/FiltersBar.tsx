'use client'

import {
  HStack,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'

interface FiltersBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  resultFilter: string
  onResultFilterChange: (value: string) => void
  speciesFilter: string
  onSpeciesFilterChange: (value: string) => void
}

export function FiltersBar({
  searchQuery,
  onSearchChange,
  resultFilter,
  onResultFilterChange,
  speciesFilter,
  onSpeciesFilterChange,
}: FiltersBarProps) {
  return (
    <HStack spacing={4} mb={6} wrap="wrap">
      <InputGroup flex={1} minW="200px">
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Buscar por nombre de mascota..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          bg="white"
        />
      </InputGroup>

      <Select
        placeholder="Todos los resultados"
        value={resultFilter}
        onChange={(e) => onResultFilterChange(e.target.value)}
        maxW="200px"
        bg="white"
      >
        <option value="NEGATIVO">NEGATIVO</option>
        <option value="POSITIVO">POSITIVO</option>
        <option value="INDETERMINADO">INDETERMINADO</option>
      </Select>

      <Select
        placeholder="Todas las especies"
        value={speciesFilter}
        onChange={(e) => onSpeciesFilterChange(e.target.value)}
        maxW="200px"
        bg="white"
      >
        <option value="Canino">Canino</option>
        <option value="Felino">Felino</option>
        <option value="Ave">Ave</option>
        <option value="Roedor">Roedor</option>
        <option value="Reptil">Reptil</option>
        <option value="Otro">Otro</option>
      </Select>
    </HStack>
  )
}
