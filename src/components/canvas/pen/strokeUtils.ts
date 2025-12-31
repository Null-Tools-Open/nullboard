import type { Point } from '../shared'

function interpolate(p0: Point, p1: Point, t: number): Point {
    const p0Press = p0.pressure ?? 0.5
    const p1Press = p1.pressure ?? 0.5
    return {
        x: p0.x + (p1.x - p0.x) * t,
        y: p0.y + (p1.y - p0.y) * t,
        pressure: p0Press + (p1Press - p0Press) * t
    }
}

function getPointsWithChaikin(points: Point[]): Point[] {
    if (points.length < 3) return points

    const newPoints: Point[] = []
    newPoints.push(points[0])

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i]
        const p1 = points[i + 1]

        newPoints.push(interpolate(p0, p1, 0.25))
        newPoints.push(interpolate(p0, p1, 0.75))
    }

    newPoints.push(points[points.length - 1])

    return newPoints
}

export function getStrokeOutline(
    points: Point[],
    options: {
        size: number
    } = { size: 10 }
): Point[] {
    if (points.length < 2) return []

    let smoothedPoints = getPointsWithChaikin(points)
    smoothedPoints = getPointsWithChaikin(smoothedPoints)

    const len = smoothedPoints.length
    const { size } = options

    const leftPoints: Point[] = []
    const rightPoints: Point[] = []

    const addCap = (center: Point, normal: { x: number, y: number }, radius: number, isStart: boolean) => {
        const steps = 8
        const angleStep = Math.PI / steps

        const baseAngle = Math.atan2(normal.y, normal.x)

        const capPoints: Point[] = []

        if (isStart) {

            for (let i = 1; i < steps; i++) {
                const theta = (baseAngle + Math.PI) - (i * angleStep)
                capPoints.push({
                    x: center.x + Math.cos(theta) * radius,
                    y: center.y + Math.sin(theta) * radius
                })
            }
        } else {

            for (let i = 1; i < steps; i++) {
                const theta = baseAngle - (i * angleStep)
                capPoints.push({
                    x: center.x + Math.cos(theta) * radius,
                    y: center.y + Math.sin(theta) * radius
                })
            }
        }
        return capPoints
    }

    for (let i = 0; i < len; i++) {
        const p = smoothedPoints[i]

        let dx = 0
        let dy = 0

        if (i < len - 1) {
            const next = smoothedPoints[i + 1]
            dx = next.x - p.x
            dy = next.y - p.y
        } else {
            const prev = smoothedPoints[i - 1]
            dx = p.x - prev.x
            dy = p.y - prev.y
        }

        if (i > 0 && i < len - 1) {
            const prev = smoothedPoints[i - 1]
            const next = smoothedPoints[i + 1]
            dx = next.x - prev.x
            dy = next.y - prev.y
        }

        const dist = Math.hypot(dx, dy)
        if (dist === 0) continue

        const nx = -dy / dist
        const ny = dx / dist

        const pressure = p.pressure ?? 0.5
        const radius = (pressure * size) + 1

        leftPoints.push({ x: p.x + nx * radius, y: p.y + ny * radius })
        rightPoints.push({ x: p.x - nx * radius, y: p.y - ny * radius })
    }

    if (leftPoints.length === 0) return []

    const startNormal = {
        x: leftPoints[0].x - smoothedPoints[0].x,
        y: leftPoints[0].y - smoothedPoints[0].y
    }
    const dStart = Math.hypot(startNormal.x, startNormal.y)
    const nStart = { x: startNormal.x / dStart, y: startNormal.y / dStart }

    const endNormal = {
        x: leftPoints[leftPoints.length - 1].x - smoothedPoints[smoothedPoints.length - 1].x,
        y: leftPoints[leftPoints.length - 1].y - smoothedPoints[smoothedPoints.length - 1].y
    }
    const dEnd = Math.hypot(endNormal.x, endNormal.y)
    const nEnd = { x: endNormal.x / dEnd, y: endNormal.y / dEnd }

    const pStart = smoothedPoints[0]
    const rStart = ((pStart.pressure ?? 0.5) * size) + 1

    const pEnd = smoothedPoints[smoothedPoints.length - 1]
    const rEnd = ((pEnd.pressure ?? 0.5) * size) + 1

    const startCap = addCap(pStart, nStart, rStart, true)
    const endCap = addCap(pEnd, nEnd, rEnd, false)

    return [
        ...startCap,
        ...leftPoints,
        ...endCap,
        ...rightPoints.reverse()
    ]
}