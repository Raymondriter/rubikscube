import * as THREE from 'three'
import type { Cubie } from './cubeState'
import type { Face, StickerColor } from './types'

const WORLD: Record<Face, THREE.Vector3> = {
  U: new THREE.Vector3(0, 1, 0),
  D: new THREE.Vector3(0, -1, 0),
  F: new THREE.Vector3(0, 0, 1),
  B: new THREE.Vector3(0, 0, -1),
  R: new THREE.Vector3(1, 0, 0),
  L: new THREE.Vector3(-1, 0, 0),
}

function facingColor(cubie: Cubie, world: THREE.Vector3): StickerColor | null {
  for (const sticker of cubie.stickers) {
    const normal = sticker.normal.clone().applyQuaternion(cubie.object.quaternion)
    if (normal.dot(world) > 0.5) return sticker.color
  }
  return null
}

/**
 * U-layer stickers on one side, left→right as seen from outside that face.
 * Used for two-sided PLL recognition (F and R bars).
 */
export function lastLayerSideColors(cubies: Cubie[], face: 'F' | 'R' | 'B' | 'L'): StickerColor[] {
  const world = WORLD[face]
  const onSide = cubies.filter((cubie) => {
    const p = cubie.object.position
    if (Math.round(p.y) !== 1) return false
    if (face === 'F') return Math.round(p.z) === 1
    if (face === 'B') return Math.round(p.z) === -1
    if (face === 'R') return Math.round(p.x) === 1
    return Math.round(p.x) === -1
  })

  const sorted = [...onSide].sort((a, b) => {
    if (face === 'F') return a.object.position.x - b.object.position.x
    if (face === 'B') return b.object.position.x - a.object.position.x
    if (face === 'R') return b.object.position.z - a.object.position.z
    return a.object.position.z - b.object.position.z
  })

  return sorted.map((cubie) => facingColor(cubie, world)).filter((color): color is StickerColor => color !== null)
}
