export type Point = [number, number, number]

export interface LaserPointerOptions {
  size?: number
  streamline?: number
  simplify?: number
  simplifyPhase?: 'input' | 'output' | 'tail'
  keepHead?: boolean
}

export interface LaserPointerStroke {
  points: Point[]
  outline: Point[]
  closed: boolean
}