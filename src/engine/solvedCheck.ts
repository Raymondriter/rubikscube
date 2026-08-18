import type { Cubie } from './cubeState'

const EPS = 1e-4

/**
 * True iff every cubie is at its home position with zero net rotation -
 * checked via its stickers' world-facing normals rather than the quaternion
 * directly, since that's the thing a lesson actually cares about (does this
 * sticker show the right color) and it's cheap: no need to build a full
 * 54-facelet string just to answer "is it solved."
 */
export function isSolved(cubies: Cubie[]): boolean {
  return cubies.every((cubie) => isCubieHome(cubie))
}

/** Whether a single cubie is at its home position and orientation - the building block per-step lesson checks will reuse. */
export function isCubieHome(cubie: Cubie): boolean {
  if (cubie.object.position.distanceToSquared(cubie.homePosition) > EPS) return false
  return cubie.stickers.every((sticker) => {
    const currentNormal = sticker.normal.clone().applyQuaternion(cubie.object.quaternion)
    return currentNormal.distanceToSquared(sticker.normal) < EPS
  })
}

/**
 * True when every face is a single color — the cube *looks* solved, even if
 * a whole-cube rotation (x2, y, …) has moved pieces off their home seats.
 * Practice mode uses this so a last-layer case held yellow-on-U counts.
 */
export function isColorSolved(cubies: Cubie[]): boolean {
  const faceColor = new Map<string, string>()
  for (const cubie of cubies) {
    for (const sticker of cubie.stickers) {
      const normal = sticker.normal.clone().applyQuaternion(cubie.object.quaternion)
      const face = facingFace(normal)
      if (!face) return false
      const existing = faceColor.get(face)
      if (existing && existing !== sticker.color) return false
      faceColor.set(face, sticker.color)
    }
  }
  return faceColor.size === 6
}

function facingFace(normal: { x: number; y: number; z: number }): string | null {
  if (normal.y > 0.5) return 'U'
  if (normal.y < -0.5) return 'D'
  if (normal.z > 0.5) return 'F'
  if (normal.z < -0.5) return 'B'
  if (normal.x > 0.5) return 'R'
  if (normal.x < -0.5) return 'L'
  return null
}
