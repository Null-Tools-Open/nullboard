import { LaserPointer } from '@excalidraw/laser-pointer'
import type { Point, LaserPointerOptions, LaserPointerStroke } from './types'

export class LaserPointerManager {
  private stroke: LaserPointer | null = null
  private options: Required<LaserPointerOptions>

  constructor(options: LaserPointerOptions = {}) {
    this.options = {
      size: options.size ?? 2,
      streamline: options.streamline ?? 0.42,
      simplify: options.simplify ?? 0.1,
      simplifyPhase: options.simplifyPhase ?? 'output',
      keepHead: options.keepHead ?? false,
    }
  }

  start(point: Point): void {
    this.stroke = new LaserPointer({
      size: this.options.size,
      streamline: this.options.streamline,
      simplify: this.options.simplify,
      simplifyPhase: this.options.simplifyPhase,
      keepHead: this.options.keepHead,
    })
    this.stroke.addPoint(point)
  }

  addPoint(point: Point): void {
    if (this.stroke) {
      this.stroke.addPoint(point)
    }
  }

  close(): LaserPointerStroke | null {
    if (!this.stroke) return null

    this.stroke.close()
    const outline = this.stroke.getStrokeOutline()

    const result: LaserPointerStroke = {
      points: [],
      outline: outline.map((p: number[]) => [p[0], p[1], 1] as Point),
      closed: true,
    }

    this.stroke = null
    return result
  }

  getCurrentOutline(): Point[] {
    if (!this.stroke) return []

    const outline = this.stroke.getStrokeOutline()
    return outline.map((p: number[]) => [p[0], p[1], 1] as Point)
  }

  isActive(): boolean {
    return this.stroke !== null
  }

  reset(): void {
    this.stroke = null
  }
}