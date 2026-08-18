import * as THREE from 'three'
import type { StickerColor } from '../types'

const STICKER_HEX: Record<StickerColor, number> = {
  white: 0xf5f5f0,
  yellow: 0xffd93d,
  red: 0xe0311f,
  orange: 0xff8c1a,
  blue: 0x2e6bff,
  green: 0x21c95e,
}

/** Okabe–Ito-inspired palette plus a letter so red/green stay distinguishable. */
const COLORBLIND_HEX: Record<StickerColor, number> = {
  white: 0xf7f7f7,
  yellow: 0xf0e442,
  red: 0xd55e00,
  orange: 0xe69f00,
  blue: 0x0072b2,
  green: 0x009e73,
}

const STICKER_LETTER: Record<StickerColor, string> = {
  white: 'W',
  yellow: 'Y',
  red: 'R',
  orange: 'O',
  blue: 'B',
  green: 'G',
}

const BODY_HEX = 0x0d0d12
const COLORS = Object.keys(STICKER_HEX) as StickerColor[]

let bodyMaterial: THREE.MeshStandardMaterial | null = null
const stickerMaterials = new Map<StickerColor, THREE.MeshStandardMaterial>()
const letterTextures = new Map<StickerColor, THREE.CanvasTexture>()
let colorblindEnabled = false

/** Shared body material - one instance reused across every cubie. */
export function getBodyMaterial(): THREE.MeshStandardMaterial {
  bodyMaterial ??= new THREE.MeshStandardMaterial({ color: BODY_HEX, roughness: 0.45, metalness: 0.15 })
  return bodyMaterial
}

function letterTexture(color: StickerColor): THREE.CanvasTexture {
  const existing = letterTextures.get(color)
  if (existing) return existing
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, 128, 128)
    ctx.fillStyle = 'rgba(10, 10, 16, 0.82)'
    ctx.font = 'bold 78px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(STICKER_LETTER[color], 64, 70)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  letterTextures.set(color, texture)
  return texture
}

/** Shared sticker material per color - six instances total, reused across every matching sticker. */
export function getStickerMaterial(color: StickerColor): THREE.MeshStandardMaterial {
  let material = stickerMaterials.get(color)
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color: (colorblindEnabled ? COLORBLIND_HEX : STICKER_HEX)[color],
      roughness: 0.2,
      metalness: 0,
      map: colorblindEnabled ? letterTexture(color) : null,
    })
    stickerMaterials.set(color, material)
  }
  return material
}

const letterOverlayMaterials = new Map<StickerColor, THREE.MeshBasicMaterial>()

export function getLetterOverlayMaterial(color: StickerColor): THREE.MeshBasicMaterial {
  let material = letterOverlayMaterials.get(color)
  if (!material) {
    material = new THREE.MeshBasicMaterial({
      map: letterTexture(color),
      transparent: true,
      depthWrite: false,
    })
    letterOverlayMaterials.set(color, material)
  }
  return material
}

export function setColorblindStickers(enabled: boolean): void {
  colorblindEnabled = enabled
  const hex = enabled ? COLORBLIND_HEX : STICKER_HEX
  for (const color of COLORS) {
    const material = stickerMaterials.get(color)
    if (!material) continue
    material.color.setHex(hex[color])
    material.needsUpdate = true
  }
}

export function isColorblindEnabled(): boolean {
  return colorblindEnabled
}
