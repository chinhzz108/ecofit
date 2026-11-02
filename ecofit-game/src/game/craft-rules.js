export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
export const quality = (mistakes, penalty = 8) => Math.round(clamp(100 - mistakes * penalty, 0, 100))
export const stars = (score) => score >= 90 ? 3 : score >= 70 ? 2 : 1
export const totalQuality = (scores) => scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0
export function pointSegmentDistance(point, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared ? clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0, 1) : 0
  return distance(point, { x: a.x + t * dx, y: a.y + t * dy })
}
export function tensionStep(tension, holding, seconds, relaxed = false) {
  return clamp(tension + (holding ? (relaxed ? 27 : 34) : -23) * seconds, 0, 100)
}
export function weaveGrade(position, target, tolerance) {
  const error = Math.abs(position - target)
  return error > tolerance ? 0 : error <= tolerance * .4 ? 100 : 80
}
export function weightTotal(weights) { return weights.reduce((sum, weight) => sum + weight, 0) }
