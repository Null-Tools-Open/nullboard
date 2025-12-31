import type { Point } from '../shared'

export type PenOptions = {
  strokeColor: string
  fillColor?: string | null
  strokeWidth: number
  opacity: number
}

export type PathElement = {
  id: string
  type: 'path'
  points: Point[]
  color: string
  width: number
  opacity: number
  bounds?: { minX: number; minY: number; maxX: number; maxY: number }
}