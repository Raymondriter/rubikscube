import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const CUBIE_SIZE = 0.95
const CUBIE_RADIUS = 0.12
const STICKER_SIZE = 0.8
const STICKER_THICKNESS = 0.04
const STICKER_RADIUS = 0.1
const STICKER_INSET = CUBIE_SIZE / 2 + STICKER_THICKNESS / 2 - 0.01

let bodyGeometry: THREE.BufferGeometry | null = null
let stickerGeometry: THREE.BufferGeometry | null = null

/** Shared geometry for a cubie's dark plastic body - all 26 cubies reuse the same instance. */
export function getCubieBodyGeometry(): THREE.BufferGeometry {
  bodyGeometry ??= new RoundedBoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE, 3, CUBIE_RADIUS)
  return bodyGeometry
}

/** Shared geometry for a single sticker - a thin rounded slab, oriented and offset per-face by the caller. */
export function getStickerGeometry(): THREE.BufferGeometry {
  stickerGeometry ??= new RoundedBoxGeometry(STICKER_SIZE, STICKER_SIZE, STICKER_THICKNESS, 2, STICKER_RADIUS)
  return stickerGeometry
}

export const STICKER_OFFSET = STICKER_INSET

let letterPlaneGeometry: THREE.BufferGeometry | null = null

export function getLetterPlaneGeometry(): THREE.BufferGeometry {
  letterPlaneGeometry ??= new THREE.PlaneGeometry(0.42, 0.42)
  return letterPlaneGeometry
}

export const LETTER_OFFSET = STICKER_INSET + 0.028
