import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { Cubie } from '../cubeState'
import {
  applyMove,
  createSolvedCubies,
  cubiesInMove,
  resetToSolved as resetCubiesToSolved,
  slotIdFromPosition,
} from '../cubeState'
import { isColorSolved, isSolved } from '../solvedCheck'
import { generateScramble } from '../scramble'
import { parseMove, parseAlgorithm } from '../notation'
import type { MoveSpec } from '../types'
import { normalizeQuarterTurns } from './dragLayers'
import { getCubieBodyGeometry, getLetterPlaneGeometry, getStickerGeometry, LETTER_OFFSET, STICKER_OFFSET } from './geometry'
import { getBodyMaterial, getLetterOverlayMaterial, getStickerMaterial, isColorblindEnabled } from './materials'

const AXIS_VECTORS: Record<MoveSpec['axis'], THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
}

const DEFAULT_MOVE_DURATION_MS = 170
const SCRAMBLE_MOVE_DURATION_MS = 90
const IDLE_AUTOROTATE_DELAY_MS = 4000

export type MoveDoneListener = () => void
export type SolvedChangeListener = (solved: boolean) => void
export type BusyChangeListener = (busy: boolean) => void

interface QueuedMove {
  move: MoveSpec
  durationMs: number
  /** Single user moves (keypad) can be fast-forwarded by a new swipe; scrambles and algorithm demos can't. */
  interruptible: boolean
}

/** A released drag easing from wherever the finger let go to the nearest quarter turn. */
interface Settle {
  axis: MoveSpec['axis']
  layers: MoveSpec['layers']
  quarterTurns: MoveSpec['quarterTurns'] | 0
  from: number
  to: number
  start: number
  durationMs: number
}

const SETTLE_MS_PER_QUARTER_TURN = 200
const SETTLE_MIN_MS = 70

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

/**
 * Owns the Three.js scene/camera/renderer and the cubies' visual meshes, and
 * is the only place that touches the shared `pivot` reparenting trick used
 * for both queued algorithm/scramble playback and CubeInteraction's live
 * drag. Whichever is using the pivot at a given moment holds an implicit
 * lock (see `isBusy`) - the two never touch cubies at the same time.
 */
export class CubeRenderer {
  readonly cubies: Cubie[]
  private readonly scene: THREE.Scene
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly controls: OrbitControls
  private readonly root: THREE.Group
  private readonly pivot: THREE.Group

  private queue: QueuedMove[] = []
  private isAnimatingQueue = false
  private animationStart = 0
  private currentQueued: QueuedMove | null = null
  private currentAffected: Cubie[] = []
  private interactionAffected: Cubie[] = []
  private dragging = false
  private settle: Settle | null = null

  private rafId = 0
  private lastSolved: boolean | null = null
  private lastBusy = false
  private lastInteractionAt = 0
  private twistEnabled = true
  private readonly highlightedMeshes: THREE.Mesh[] = []
  private readonly letterMeshes: THREE.Mesh[] = []
  private readonly moveDoneListeners = new Set<MoveDoneListener>()
  private readonly solvedChangeListeners = new Set<SolvedChangeListener>()
  private readonly busyChangeListeners = new Set<BusyChangeListener>()

  constructor(container: HTMLElement) {
    this.cubies = createSolvedCubies()

    this.scene = new THREE.Scene()

    const { clientWidth, clientHeight } = container
    this.camera = new THREE.PerspectiveCamera(40, clientWidth / Math.max(clientHeight, 1), 0.1, 100)
    this.camera.position.set(4.2, 4.2, 5.4)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(clientWidth, clientHeight)
    container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.enablePan = false
    this.controls.minDistance = 5.5
    this.controls.maxDistance = 10.5
    this.controls.target.set(0, 0, 0)
    this.controls.autoRotateSpeed = 0.6
    this.controls.addEventListener('start', () => this.noteInteraction())

    this.root = new THREE.Group()
    this.pivot = new THREE.Group()
    this.root.add(this.pivot)
    this.scene.add(this.root)

    this.buildLights()
    this.buildCubieMeshes()

    this.animate = this.animate.bind(this)
    this.animate()
  }

  /** Resets the idle timer that gates ambient auto-rotate - called on any drag, twist, scramble, or reset. */
  private noteInteraction(): void {
    this.lastInteractionAt = performance.now()
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  get orbitControls(): OrbitControls {
    return this.controls
  }

  get cameraInstance(): THREE.PerspectiveCamera {
    return this.camera
  }

  get rootGroup(): THREE.Group {
    return this.root
  }

  /**
   * Nudges the camera around the cube by a fixed angular step - the keyboard-arrow
   * equivalent of a drag-to-orbit gesture, for stepping through every face precisely
   * instead of fighting with a free drag. Polar angle is clamped away from the exact
   * poles (straight up/down) to avoid the camera flipping through the cube.
   */
  stepOrbit(deltaAzimuthRad: number, deltaPolarRad: number): void {
    this.noteInteraction()
    const offset = this.camera.position.clone().sub(this.controls.target)
    const spherical = new THREE.Spherical().setFromVector3(offset)
    spherical.theta += deltaAzimuthRad
    spherical.phi = Math.min(Math.max(spherical.phi + deltaPolarRad, 0.15), Math.PI - 0.15)
    const nextOffset = new THREE.Vector3().setFromSpherical(spherical)
    this.camera.position.copy(this.controls.target).add(nextOffset)
    this.camera.lookAt(this.controls.target)
  }

  /** True while either a queued animation or an interactive drag (live or settling) currently owns the pivot. */
  get isBusy(): boolean {
    return this.isAnimatingQueue || this.interactionAffected.length > 0
  }

  /**
   * Whether a new swipe may fast-forward whatever is animating. A user
   * twisting quickly should never have their next swipe swallowed (or turned
   * into a camera orbit) just because the previous turn is still easing in -
   * but a scramble or an algorithm demo is not theirs to cut short.
   */
  get canInterrupt(): boolean {
    if (this.dragging) return false
    const queued = this.queue.every((entry) => entry.interruptible)
    if (this.settle) return queued
    if (this.isAnimatingQueue) return (this.currentQueued?.interruptible ?? false) && queued
    return true
  }

  /** Instantly completes a settling drag and any queued user moves. Returns false if something non-interruptible is running. */
  finishInterruptible(): boolean {
    if (!this.canInterrupt) return false
    if (this.settle) this.finishSettle()
    while (this.isAnimatingQueue && this.currentQueued) this.completeCurrentQueued()
    return true
  }

  /** Kills any orbit momentum so the camera holds still while a finger is on the cube. */
  freezeCamera(): void {
    const internal = this.controls as unknown as { _sphericalDelta?: THREE.Spherical }
    internal._sphericalDelta?.set(0, 0, 0)
  }

  private buildLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.55)
    const key = new THREE.DirectionalLight(0xfff4e0, 1.2)
    key.position.set(5, 8, 6)
    const fill = new THREE.DirectionalLight(0xdce8ff, 0.35)
    fill.position.set(-6, -3, -4)
    const rim = new THREE.DirectionalLight(0xaac4ff, 0.5)
    rim.position.set(-4, 5, -6)
    this.scene.add(ambient, key, fill, rim)
  }

  private buildCubieMeshes(): void {
    for (const cubie of this.cubies) {
      const body = new THREE.Mesh(getCubieBodyGeometry(), getBodyMaterial())
      cubie.object.add(body)
      for (const sticker of cubie.stickers) {
        const mesh = new THREE.Mesh(getStickerGeometry(), getStickerMaterial(sticker.color))
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), sticker.normal)
        mesh.position.copy(sticker.normal).multiplyScalar(STICKER_OFFSET)
        mesh.userData.role = 'sticker'
        cubie.object.add(mesh)
        const letter = new THREE.Mesh(getLetterPlaneGeometry(), getLetterOverlayMaterial(sticker.color))
        letter.quaternion.copy(mesh.quaternion)
        letter.position.copy(sticker.normal).multiplyScalar(LETTER_OFFSET)
        letter.visible = isColorblindEnabled()
        cubie.object.add(letter)
        this.letterMeshes.push(letter)
      }
      this.root.add(cubie.object)
    }
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(height, 1)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId)
    this.clearHighlights()
    this.controls.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  onMoveDone(listener: MoveDoneListener): () => void {
    this.moveDoneListeners.add(listener)
    return () => this.moveDoneListeners.delete(listener)
  }

  onSolvedChange(listener: SolvedChangeListener): () => void {
    this.solvedChangeListeners.add(listener)
    return () => this.solvedChangeListeners.delete(listener)
  }

  /** Fires whenever the queue/interaction lock (isBusy) transitions - lets the UI disable "start a new thing" controls while something is already animating. */
  onBusyChange(listener: BusyChangeListener): () => void {
    this.busyChangeListeners.add(listener)
    return () => this.busyChangeListeners.delete(listener)
  }

  getIsSolved(): boolean {
    return isSolved(this.cubies)
  }

  getIsColorSolved(): boolean {
    return isColorSolved(this.cubies)
  }

  setTwistEnabled(enabled: boolean): void {
    this.twistEnabled = enabled
  }

  setLetterOverlaysVisible(visible: boolean): void {
    for (const mesh of this.letterMeshes) mesh.visible = visible
  }

  get isTwistEnabled(): boolean {
    return this.twistEnabled
  }

  private notifySolvedChange(): void {
    // Deliberately the "looks solved" check, not the home-seat one. Rotating
    // the whole cube to see another face is a normal part of solving, and it
    // moves every cubie off its home seat without changing a thing about
    // whether the cube is solved - so `isSolved` would report a finished cube
    // as scrambled and, in the Sandbox, never stop the timer. This only became
    // reachable once rotations existed as a gesture and a keypad key; Practice
    // and the Trainer already judge solves with `getIsColorSolved`.
    const solved = this.getIsColorSolved()
    if (solved !== this.lastSolved) {
      this.lastSolved = solved
      for (const listener of this.solvedChangeListeners) listener(solved)
    }
  }

  private notifyBusyChange(): void {
    const busy = this.isBusy
    if (busy !== this.lastBusy) {
      this.lastBusy = busy
      for (const listener of this.busyChangeListeners) listener(busy)
    }
  }

  // --- Queued (algorithm / scramble) moves ---
  // Each of these is a no-op while isBusy: a move already in flight (or a
  // drag in progress) owns the pivot, and queuing more on top of it is how a
  // few impatient clicks on "Scramble" turn into a much longer, confusing
  // animation than anyone asked for - see RUBIKSCUBE-22.

  enqueueAlgorithm(algorithm: string, durationMs = DEFAULT_MOVE_DURATION_MS): void {
    if (this.isBusy) return
    for (const move of parseAlgorithm(algorithm)) this.queue.push({ move, durationMs, interruptible: false })
    this.processQueue()
    this.notifyBusyChange()
  }

  enqueueMove(token: string, durationMs = DEFAULT_MOVE_DURATION_MS): void {
    if (this.dragging) return
    this.queue.push({ move: parseMove(token), durationMs, interruptible: true })
    this.processQueue()
    this.notifyBusyChange()
  }

  /** Applies moves with no animation. Used to snap a demo/practice cube to a case's setup. */
  applyAlgorithmInstant(algorithm: string): void {
    if (!algorithm.trim()) return
    this.clearQueueVisuals()
    for (const move of parseAlgorithm(algorithm)) applyMove(this.cubies, move)
    this.notifySolvedChange()
    this.notifyBusyChange()
  }

  setHighlightSlots(slots: string[]): void {
    this.clearHighlights()
    if (slots.length === 0) return
    const wanted = new Set(slots)
    for (const cubie of this.cubies) {
      if (!wanted.has(slotIdFromPosition(cubie.object.position))) continue
      for (const child of cubie.object.children) {
        if (child.userData.role !== 'sticker' || !(child instanceof THREE.Mesh)) continue
        const base = child.material
        if (!(base instanceof THREE.MeshStandardMaterial)) continue
        const highlight = base.clone()
        highlight.emissive = new THREE.Color(0xffffff)
        highlight.emissiveIntensity = 0.45
        child.userData.baseMaterial = base
        child.material = highlight
        this.highlightedMeshes.push(child)
      }
    }
  }

  private clearHighlights(): void {
    for (const mesh of this.highlightedMeshes) {
      const highlight = mesh.material
      const base = mesh.userData.baseMaterial
      if (base) mesh.material = base
      if (highlight instanceof THREE.MeshStandardMaterial && highlight !== base) highlight.dispose()
    }
    this.highlightedMeshes.length = 0
  }

  private clearQueueVisuals(): void {
    this.queue = []
    this.isAnimatingQueue = false
    this.currentQueued = null
    this.currentAffected = []
    this.interactionAffected = []
    this.dragging = false
    this.settle = null
    this.releasePivot()
  }

  /** Queues a random scramble and returns the move tokens used, so the UI can display them. Returns [] while already busy, rather than stacking on top of what's in flight. */
  scramble(length = 22): string[] {
    if (this.isBusy) return []
    this.noteInteraction()
    const tokens = generateScramble(length)
    for (const token of tokens) this.queue.push({ move: parseMove(token), durationMs: SCRAMBLE_MOVE_DURATION_MS, interruptible: false })
    this.processQueue()
    this.notifyBusyChange()
    return tokens
  }

  /** Reparents anything currently attached to the pivot (an interrupted queued animation or drag) back to root. */
  private releasePivot(): void {
    for (const child of [...this.pivot.children]) this.root.add(child)
    this.pivot.quaternion.identity()
  }

  reset(): void {
    this.noteInteraction()
    this.clearQueueVisuals()
    this.clearHighlights()
    resetCubiesToSolved(this.cubies)
    this.notifySolvedChange()
    this.notifyBusyChange()
  }

  private processQueue(): void {
    if (this.isBusy || this.queue.length === 0) return
    const next = this.queue.shift()
    if (!next) return
    this.isAnimatingQueue = true
    this.currentQueued = next
    this.currentAffected = cubiesInMove(this.cubies, next.move)
    for (const cubie of this.currentAffected) this.pivot.add(cubie.object)
    this.animationStart = performance.now()
  }

  private stepQueueAnimation(now: number): void {
    if (!this.isAnimatingQueue || !this.currentQueued) return
    const { move, durationMs } = this.currentQueued
    const t = Math.min((now - this.animationStart) / durationMs, 1)
    const angle = move.quarterTurns * (Math.PI / 2) * easeOutCubic(t)
    this.pivot.quaternion.setFromAxisAngle(AXIS_VECTORS[move.axis], angle)

    if (t >= 1) this.completeCurrentQueued()
  }

  private completeCurrentQueued(): void {
    if (!this.currentQueued) return
    const { move } = this.currentQueued
    for (const cubie of this.currentAffected) this.root.add(cubie.object)
    applyMove(this.cubies, move)
    this.pivot.quaternion.identity()
    this.isAnimatingQueue = false
    this.currentQueued = null
    this.currentAffected = []
    for (const listener of this.moveDoneListeners) listener()
    this.notifySolvedChange()
    this.processQueue()
    this.notifyBusyChange()
  }

  // --- Interactive (drag) twist - driven by CubeInteraction ---
  // The caller (CubeInteraction) is responsible for only starting a twist
  // when `!isBusy`, and for computing axis/layers/angle from the pointer
  // gesture; this class only owns the scene-graph mechanics.

  beginInteractiveTwist(move: Pick<MoveSpec, 'axis' | 'layers'>): Cubie[] {
    this.noteInteraction()
    this.dragging = true
    this.interactionAffected = cubiesInMove(this.cubies, { ...move, quarterTurns: 1 })
    for (const cubie of this.interactionAffected) this.pivot.add(cubie.object)
    this.notifyBusyChange()
    return this.interactionAffected
  }

  setInteractiveTwistAngle(axis: MoveSpec['axis'], angleRadians: number): void {
    this.pivot.quaternion.setFromAxisAngle(AXIS_VECTORS[axis], angleRadians)
  }

  /**
   * Ends the drag. The layer eases from `fromAngle` (where the finger let go)
   * to `turns` whole quarter turns instead of jumping there, then commits.
   * `turns` may be any integer - a 270° drag lands visually where it was
   * released and is recorded as the equivalent single counter-turn; 0 or a
   * full 360° cancel without recording a move.
   */
  releaseInteractiveTwist(axis: MoveSpec['axis'], layers: MoveSpec['layers'], fromAngle: number, turns: number): void {
    this.noteInteraction()
    this.dragging = false
    const to = turns * (Math.PI / 2)
    const remainingQuarterTurns = Math.abs(to - fromAngle) / (Math.PI / 2)
    this.settle = {
      axis,
      layers,
      quarterTurns: normalizeQuarterTurns(turns),
      from: fromAngle,
      to,
      start: performance.now(),
      durationMs: Math.max(SETTLE_MIN_MS, remainingQuarterTurns * SETTLE_MS_PER_QUARTER_TURN),
    }
  }

  private stepSettle(now: number): void {
    const settle = this.settle
    if (!settle) return
    const t = Math.min((now - settle.start) / settle.durationMs, 1)
    this.pivot.quaternion.setFromAxisAngle(AXIS_VECTORS[settle.axis], settle.from + (settle.to - settle.from) * easeOutCubic(t))
    if (t >= 1) this.finishSettle()
  }

  private finishSettle(): void {
    const settle = this.settle
    if (!settle) return
    this.settle = null
    for (const cubie of this.interactionAffected) this.root.add(cubie.object)
    this.pivot.quaternion.identity()
    this.interactionAffected = []
    if (settle.quarterTurns !== 0) {
      applyMove(this.cubies, { axis: settle.axis, layers: settle.layers, quarterTurns: settle.quarterTurns })
      for (const listener of this.moveDoneListeners) listener()
    }
    this.notifySolvedChange()
    this.processQueue()
    this.notifyBusyChange()
  }

  private animate(now?: number): void {
    this.rafId = requestAnimationFrame(this.animate)
    const time = now ?? performance.now()
    // Ambient spin is for look-only cubes (lesson demos). On a cube you can twist it just moves
    // the target out from under your finger between turns.
    this.controls.autoRotate = !this.twistEnabled && !this.isBusy && time - this.lastInteractionAt > IDLE_AUTOROTATE_DELAY_MS
    this.controls.update()
    if (this.settle) this.stepSettle(time)
    if (this.isAnimatingQueue) this.stepQueueAnimation(time)
    if (this.highlightedMeshes.length > 0) {
      const pulse = 0.28 + 0.32 * (0.5 + 0.5 * Math.sin(time * 0.006))
      for (const mesh of this.highlightedMeshes) {
        const material = mesh.material
        if (material instanceof THREE.MeshStandardMaterial) material.emissiveIntensity = pulse
      }
    }
    this.renderer.render(this.scene, this.camera)
  }
}

