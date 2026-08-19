import { describe, expect, it } from 'vitest'
import {
  CUBE_SKINS,
  DEFAULT_SKIN_ID,
  getBodyMaterial,
  getCubeSkinId,
  getStickerMaterial,
  setColorblindStickers,
  setCubeSkin,
} from './materials'

describe('cube skins', () => {
  it('has unique ids and includes the default', () => {
    const ids = CUBE_SKINS.map((skin) => skin.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain(DEFAULT_SKIN_ID)
  })

  it('never varies sticker hue - only body color and material finish', () => {
    for (const skin of CUBE_SKINS) {
      expect(skin).not.toHaveProperty('stickerColor')
      expect(skin.sticker).not.toHaveProperty('color')
    }
  })

  it('setCubeSkin updates cached material finish without touching sticker color', () => {
    const sticker = getStickerMaterial('red')
    const stickerColorBefore = sticker.color.getHex()
    const body = getBodyMaterial()

    setCubeSkin('chrome')
    const chrome = CUBE_SKINS.find((skin) => skin.id === 'chrome')
    if (!chrome) throw new Error('chrome skin missing')

    expect(getCubeSkinId()).toBe('chrome')
    expect(body.color.getHex()).toBe(chrome.body.color)
    expect(body.roughness).toBe(chrome.body.roughness)
    expect(body.metalness).toBe(chrome.body.metalness)
    expect(sticker.roughness).toBe(chrome.sticker.roughness)
    expect(sticker.metalness).toBe(chrome.sticker.metalness)
    expect(sticker.color.getHex()).toBe(stickerColorBefore)

    setCubeSkin(DEFAULT_SKIN_ID)
  })

  it('falls back to the default skin for an unknown id', () => {
    setCubeSkin('not-a-real-skin')
    expect(getCubeSkinId()).toBe(DEFAULT_SKIN_ID)
  })
})

describe('colorblind stickers', () => {
  // Regression: the sticker material used to sample the letter canvas as its
  // `map`. A map multiplies against `color`, and that canvas is transparent
  // (rgb 0,0,0) everywhere outside the glyph - so every sticker rendered black
  // and stayed black after toggling the setting off, because the cached
  // material's map was never cleared. Letters come from the overlay meshes.
  it('keeps the sticker material free of a texture map in either mode', () => {
    setColorblindStickers(true)
    const sticker = getStickerMaterial('blue')
    expect(sticker.map).toBeNull()
    expect(sticker.color.getHex()).toBe(0x0072b2)

    setColorblindStickers(false)
    expect(sticker.map).toBeNull()
    expect(sticker.color.getHex()).toBe(0x2e6bff)
  })
})
