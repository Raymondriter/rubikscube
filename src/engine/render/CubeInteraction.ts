import * as THREE from 'three'
import type { CubeRenderer } from './CubeRenderer'
import type { Axis, Coord } from '../types'
import { asCoord, chooseTwist, faceNormalAt, layersForDrag, releaseTurns } from './dragLayers'

/** Movement before a press on the cube becomes a twist. Fingers jitter more than mice. */
const COMMIT_THRESHOLD_PX = { touch: 12, pen: 8, mouse: 6 } as const
/** World distance along the face the finger travels for one quarter turn - about half the cube's width, so a sticker roughly follows the finger. */
const WORLD_UNITS_PER_QUARTER_TURN = 1.6
/** Floor on that distance in pixels, so a face seen nearly edge-on doesn't become hair-trigger. */
const MIN_PX_PER_QUARTER_TURN_FRACTION = 0.12
/** Only this much recent movement counts toward flick speed; a finger that paused before lifting didn't flick. */
const VELOCITY_WINDOW_MS = 90
/** Slower than this at release (~300px/s) and the drag lands wherever it's nearest, with no carry-on. */
const MIN_FLICK_PX_PER_MS = 0.3
const ARROW_KEY_STEP_RAD = Math.PI / 15 // 12° per press - about 24 presses for a full loop around

interface Grab {
  pointerId: number
  pointerType: keyof typeof COMMIT_THRESHOLD_PX
  startX: number
  startY: number
  point: THREE.Vector3
  normal: THREE.Vector3
  cubiePosition: THREE.Vector3
}

interface Twist {
  pointerId: number
  startX: number
  startY: number
  axis: Axis
  layers: Coord[]
  /** Unit screen direction a positive tangent drag moves along. */
  screenDir: THREE.Vector2
  pxPerQuarterTurn: number
  sign: 1 | -1
  angle: number
  samples: { time: number; px: number }[]
}

/**
 * Turns pointer input into layer twists.
 *
 * The rule is simple so it stays predictable: press on the cube and you are
 * twisting, press on the background and you are orbiting the camera. A
 * press on the cube freezes the camera immediately - it never orbits for the
 * first few pixels and then changes its mind - and exactly one layer turns,
 * however much the finger wanders. CubeRenderer owns the scene-graph
 * mechanics; this class only calls its small imperative API.
 */
export class CubeInteraction {
  private readonly renderer: CubeRenderer
  private readonly raycaster = new THREE.Raycaster()
  private readonly activePointers = new Set<number>()
  private grab: Grab | null = null
  private twist: Twist | null = null

  constructor(renderer: CubeRenderer) {
    this.renderer = renderer
    const el = renderer.domElement
    el.style.touchAction = 'none'
    // Capture phase so this runs before OrbitControls' own listener and can
    // switch it off before it starts orbiting.
    el.addEventListener('pointerdown', this.onPointerDown, { capture: true })
    el.addEventListener('pointermove', this.onPointerMove)
    el.addEventListener('pointerup', this.onPointerUp)
    el.addEventListener('pointercancel', this.onPointerUp)
    window.addEventListener('keydown', this.onKeyDown)
  }

  dispose(): void {
    const el = this.renderer.domElement
    el.removeEventListener('pointerdown', this.onPointerDown, { capture: true })
    el.removeEventListener('pointermove', this.onPointerMove)
    el.removeEventListener('pointerup', this.onPointerUp)
    el.removeEventListener('pointercancel', this.onPointerUp)
    window.removeEventListener('keydown', this.onKeyDown)
  }

  /**
   * Arrow keys step the camera around the cube by a fixed angle - a precise,
   * discrete alternative to dragging for anyone who finds free-orbit fiddly,
   * and a quick way to cycle through every face deliberately.
   */
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        this.renderer.stepOrbit(-ARROW_KEY_STEP_RAD, 0)
        return
      case 'ArrowRight':
        event.preventDefault()
        this.renderer.stepOrbit(ARROW_KEY_STEP_RAD, 0)
        return
      case 'ArrowUp':
        event.preventDefault()
        this.renderer.stepOrbit(0, -ARROW_KEY_STEP_RAD)
        return
      case 'ArrowDown':
        event.preventDefault()
        this.renderer.stepOrbit(0, ARROW_KEY_STEP_RAD)
        return
      default:
        return
    }
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    // A primary pointer means nothing else is down; drop any id whose pointerup we never saw.
    if (event.isPrimary) this.activePointers.clear()
    this.activePointers.add(event.pointerId)
    // A second finger while one is already down is a pinch/orbit (or a stray palm) - never a new twist.
    if (this.activePointers.size > 1 || this.grab || this.twist) return
    if (!this.renderer.isTwistEnabled) return
    // Let a quick follow-up swipe finish the previous turn instead of being swallowed.
    // A scramble or algorithm demo still can't be interrupted; the press orbits instead.
    if (this.renderer.isBusy && !this.renderer.finishInterruptible()) return

    const hit = this.raycast(event.clientX, event.clientY)
    if (!hit?.object.parent) return

    const cubiePosition = hit.object.parent.getWorldPosition(new THREE.Vector3()).round()
    const n = faceNormalAt(hit.point)
    this.grab = {
      pointerId: event.pointerId,
      pointerType: event.pointerType === 'touch' || event.pointerType === 'pen' ? event.pointerType : 'mouse',
      startX: event.clientX,
      startY: event.clientY,
      point: hit.point.clone(),
      normal: new THREE.Vector3(n.x, n.y, n.z),
      cubiePosition,
    }
    this.renderer.orbitControls.enabled = false
    this.renderer.freezeCamera()
    // Keep receiving moves if the finger slides off the canvas. Throws for a pointer that is no longer active.
    try {
      this.renderer.domElement.setPointerCapture(event.pointerId)
    } catch {
      // The gesture still works while the pointer stays over the canvas.
    }
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const twist = this.twist
    if (twist && event.pointerId === twist.pointerId) {
      const px = this.projectedPx(twist, event.clientX, event.clientY)
      twist.angle = (px / twist.pxPerQuarterTurn) * (Math.PI / 2) * twist.sign
      twist.samples.push({ time: event.timeStamp, px })
      while (twist.samples.length > 2 && event.timeStamp - twist.samples[0].time > VELOCITY_WINDOW_MS) twist.samples.shift()
      this.renderer.setInteractiveTwistAngle(twist.axis, twist.angle)
      return
    }
    const grab = this.grab
    if (grab && event.pointerId === grab.pointerId) {
      const dx = event.clientX - grab.startX
      const dy = event.clientY - grab.startY
      if (Math.hypot(dx, dy) >= COMMIT_THRESHOLD_PX[grab.pointerType]) this.startTwist(event)
    }
  }

  private readonly onPointerUp = (event: PointerEvent): void => {
    this.activePointers.delete(event.pointerId)
    const twist = this.twist
    if (twist && event.pointerId === twist.pointerId) {
      this.twist = null
      const turns = (twist.angle / (Math.PI / 2)) * twist.sign
      const velocity = event.type === 'pointercancel' ? 0 : this.velocityTurnsPerMs(twist, event.timeStamp)
      const landed = releaseTurns(turns, velocity) * twist.sign
      this.renderer.releaseInteractiveTwist(twist.axis, twist.layers, twist.angle, landed)
      this.endGesture(event.pointerId)
      return
    }
    if (this.grab && event.pointerId === this.grab.pointerId) {
      this.grab = null
      this.endGesture(event.pointerId)
    }
  }

  private endGesture(pointerId: number): void {
    const el = this.renderer.domElement
    if (el.hasPointerCapture?.(pointerId)) el.releasePointerCapture(pointerId)
    this.renderer.orbitControls.enabled = true
  }

  /**
   * Called once a press on the cube has moved far enough to read a
   * direction. Locks in the axis and layer for the rest of the gesture.
   */
  private startTwist(event: PointerEvent): void {
    const grab = this.grab
    if (!grab) return

    const onFace = this.pointOnFacePlane(grab, event.clientX, event.clientY)
    const choice = onFace ? chooseTwist(grab.normal, onFace.sub(grab.point)) : null
    if (!choice) return
    const layer = asCoord(grab.cubiePosition[choice.axis])
    if (layer === null) return

    const tangent = new THREE.Vector3()
    tangent[choice.tangent] = 1
    const from = this.toScreen(grab.point)
    const to = this.toScreen(grab.point.clone().addScaledVector(tangent, WORLD_UNITS_PER_QUARTER_TURN))
    const screenVec = to.sub(from)
    const rect = this.renderer.domElement.getBoundingClientRect()
    const pxPerQuarterTurn = Math.max(screenVec.length(), Math.min(rect.width, rect.height) * MIN_PX_PER_QUARTER_TURN_FRACTION)
    if (screenVec.lengthSq() === 0) return

    this.grab = null
    const layers = layersForDrag({ layer, shiftKey: event.shiftKey, rotateKey: event.ctrlKey || event.metaKey })
    this.twist = {
      pointerId: grab.pointerId,
      startX: grab.startX,
      startY: grab.startY,
      axis: choice.axis,
      layers,
      screenDir: screenVec.normalize(),
      pxPerQuarterTurn,
      sign: choice.sign,
      angle: 0,
      samples: [],
    }
    this.renderer.beginInteractiveTwist({ axis: choice.axis, layers })
    // Measured from the press itself, so the layer is already under the finger rather than lagging by the threshold.
    this.onPointerMove(event)
  }

  private projectedPx(twist: Twist, clientX: number, clientY: number): number {
    return twist.screenDir.x * (clientX - twist.startX) + twist.screenDir.y * (clientY - twist.startY)
  }

  private velocityTurnsPerMs(twist: Twist, now: number): number {
    const samples = twist.samples
    const last = samples[samples.length - 1]
    const first = samples[0]
    if (!last || !first || last === first) return 0
    // Finger stopped before lifting: no flick.
    if (now - last.time > VELOCITY_WINDOW_MS / 2) return 0
    const dt = last.time - first.time
    if (dt <= 0) return 0
    const pxPerMs = (last.px - first.px) / dt
    // A slow, deliberate drag that's still creeping when the finger lifts isn't a flick.
    if (Math.abs(pxPerMs) < MIN_FLICK_PX_PER_MS) return 0
    return pxPerMs / twist.pxPerQuarterTurn
  }

  private raycast(clientX: number, clientY: number): THREE.Intersection | undefined {
    this.raycaster.setFromCamera(this.toNdc(clientX, clientY), this.renderer.cameraInstance)
    return this.raycaster.intersectObjects(this.renderer.rootGroup.children, true)[0]
  }

  /** Where the pointer's ray meets the plane of the grabbed face, or null if it's (nearly) parallel to it. */
  private pointOnFacePlane(grab: Grab, clientX: number, clientY: number): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.toNdc(clientX, clientY), this.renderer.cameraInstance)
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(grab.normal, grab.point)
    return this.raycaster.ray.intersectPlane(plane, new THREE.Vector3())
  }

  private toNdc(clientX: number, clientY: number): THREE.Vector2 {
    const rect = this.renderer.domElement.getBoundingClientRect()
    return new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
  }

  private toScreen(world: THREE.Vector3): THREE.Vector2 {
    const rect = this.renderer.domElement.getBoundingClientRect()
    const ndc = world.clone().project(this.renderer.cameraInstance)
    return new THREE.Vector2(((ndc.x + 1) / 2) * rect.width, ((1 - ndc.y) / 2) * rect.height)
  }
}
