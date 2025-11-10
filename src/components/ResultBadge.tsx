import { Badge } from '@chakra-ui/react'

interface ResultBadgeProps {
  result: 'NEGATIVO' | 'POSITIVO' | 'INDETERMINADO'
}

export function ResultBadge({ result }: ResultBadgeProps) {
  const colorScheme =
    result === 'NEGATIVO'
      ? 'green'
      : result === 'POSITIVO'
      ? 'red'
      : 'yellow'

  return (
    <Badge colorScheme={colorScheme} fontSize="sm" px={2} py={1} rounded="md">
      {result}
    </Badge>
  )
}
