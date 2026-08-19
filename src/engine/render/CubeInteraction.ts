import * as THREE from 'three'
import type { CubeRenderer } from './CubeRenderer'
import type { Axis, Coord, MoveSpec } from '../types'
import { asCoord, expandLayers, layersForDrag } from './dragLayers'

const DRAG_COMMIT_THRESHOLD_PX = 8
const SNAP_BACK_FRACTION = 0.5 // drags under half a quarter-turn cancel back to the pre-drag state
const ARROW_KEY_STEP_RAD = Math.PI / 15 // 12° per press - about 24 presses for a full loop around

const AXES: Axis[] = ['x', 'y', 'z']

interface CommittedDrag {
  pointerId: number
  startX: number
  startY: number
  axis: Axis
  layers: Coord[]
  /** Screen-space direction (unnormalized is fine) that a positive rotation angle moves along. */
  screenDir: THREE.Vector2
  /** +1 or -1: maps "positive drag along screenDir" to the correct signed quarterTurns about +axis. */
  sign: 1 | -1
}

interface PendingDrag {
  pointerId: number
  startX: number
  startY: number
  cubieWorldPos: THREE.Vector3
  faceNormal: THREE.Vector3
}

/**
 * Owns raycasting and gesture disambiguation: a plain click-drag on empty
 * space (or on the cube while it's busy) orbits the camera; a drag that
 * starts on a cubie face and crosses a small pixel threshold becomes a layer
 * twist. Smearing onto a neighbouring layer mid-drag grows the turn into a
 * wide move or a whole-cube rotation. CubeRenderer owns the actual
 * scene-graph mechanics (the pivot) - this class only ever calls its small
 * imperative API, so there's exactly one place that can touch cubie
 * transforms.
 */
export class CubeInteraction {
  private readonly renderer: CubeRenderer
  private readonly raycaster = new THREE.Raycaster()
  private readonly pointerNdc = new THREE.Vector2()
  private pending: PendingDrag | null = null
  private committed: CommittedDrag | null = null

  constructor(renderer: CubeRenderer) {
    this.renderer = renderer
    const el = renderer.domElement
    el.style.touchAction = 'none'
    el.addEventListener('pointerdown', this.onPointerDown)
    el.addEventListener('pointermove', this.onPointerMove)
    el.addEventListener('pointerup', this.onPointerUp)
    el.addEventListener('pointercancel', this.onPointerUp)
    window.addEventListener('keydown', this.onKeyDown)
  }

  dispose(): void {
    const el = this.renderer.domElement
    el.removeEventListener('pointerdown', this.onPointerDown)
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

  private toNdc(event: PointerEvent): THREE.Vector2 {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointerNdc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )
    return this.pointerNdc
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    // Busy (queued animation or another drag already in flight) - fall back to plain orbit, no twist candidate.
    if (this.renderer.isBusy || !this.renderer.isTwistEnabled) return

    const ndc = this.toNdc(event)
    this.raycaster.setFromCamera(ndc, this.renderer.cameraInstance)
    const hits = this.raycaster.intersectObjects(this.renderer.rootGroup.children, true)
    const hit = hits[0]
    if (!hit || !hit.face || !hit.object.parent) return // miss - let OrbitControls handle the drag as camera orbit

    const worldNormal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).round()
    const cubieObject = hit.object.parent // body/sticker meshes are always direct children of their cubie's Object3D

    this.pending = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cubieWorldPos: cubieObject.getWorldPosition(new THREE.Vector3()).round(),
      faceNormal: worldNormal,
    }
    // Don't disable orbit controls yet - a sub-threshold movement should still be free to orbit.
    // We only commit (and freeze the camera) once the drag threshold is crossed, in onPointerMove.
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (this.committed && event.pointerId === this.committed.pointerId) {
      const d = this.committed
      this.growCommittedLayers(event)
      const dx = event.clientX - d.startX
      const dy = event.clientY - d.startY
      this.renderer.setInteractiveTwistAngle(d.axis, this.signedAngle(d, dx, dy))
      return
    }
    if (this.pending && event.pointerId === this.pending.pointerId) {
      const dx = event.clientX - this.pending.startX
      const dy = event.clientY - this.pending.startY
      if (Math.hypot(dx, dy) >= DRAG_COMMIT_THRESHOLD_PX) this.commitTwistGesture(event, dx, dy)
    }
  }

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.committed && event.pointerId === this.committed.pointerId) {
      const d = this.committed
      this.committed = null
      const dx = event.clientX - d.startX
      const dy = event.clientY - d.startY
      const quarterTurns = snapToQuarterTurns(this.signedAngle(d, dx, dy))
      this.renderer.commitInteractiveTwist(d.axis, d.layers, quarterTurns)
      this.renderer.orbitControls.enabled = true
      return
    }
    if (this.pending && event.pointerId === this.pending.pointerId) this.pending = null
  }

  private signedAngle(d: CommittedDrag, dx: number, dy: number): number {
    const rect = this.renderer.domElement.getBoundingClientRect()
    const pxPerQuarterTurn = rect.height * 0.18
    const projectedPx = d.screenDir.x * dx + d.screenDir.y * dy
    return projectedPx * ((Math.PI / 2) / pxPerQuarterTurn) * d.sign
  }

  /**
   * Called once a drag crosses the commit threshold: determines the twist
   * axis and its screen-space direction from the clicked face's plane (see
   * notation.ts's header comment for the sign-convention reasoning this
   * mirrors), then locks the gesture in for the rest of the drag - it never
   * re-evaluates axis choice mid-gesture even if the pointer wanders.
   */
  private commitTwistGesture(event: PointerEvent, dx: number, dy: number): void {
    if (!this.pending) return
    const normal = this.pending.faceNormal

    // The two candidate tangent directions in the clicked face's plane are the world axes
    // other than the face normal's own axis. Whichever one's screen-space projection best
    // explains the actual drag vector is the one the user is dragging along.
    const candidates = AXES.filter((axis) => Math.abs(normal[axis]) < 0.5)
    let bestAxis: Axis | null = null
    let bestScreenDir = new THREE.Vector2()
    let bestScore = -Infinity
    for (const axis of candidates) {
      const screenDir = this.worldDirectionToScreen(axisVector(axis))
      const score = Math.abs(screenDir.x * dx + screenDir.y * dy)
      if (score > bestScore) {
        bestScore = score
        bestAxis = axis
        bestScreenDir = screenDir
      }
    }
    if (!bestAxis) return

    // rotationAxis + sign both fall out of this single cross product (see the plan's
    // interaction-design notes): crossing the face normal with the (unsigned) candidate
    // tangent axis gives the axis to rotate about, and the sign of that result tells us
    // whether "positive drag along bestScreenDir" means +quarterTurns or -quarterTurns.
    const rotationAxisVec = normal.clone().cross(axisVector(bestAxis)).round()
    const axis = dominantAxis(rotationAxisVec)
    if (!axis) return
    const sign = Math.sign(rotationAxisVec[axis]) as 1 | -1
    const startLayer = asCoord(this.pending.cubieWorldPos[axis])
    if (startLayer === null) return
    const endLayer = this.layerAtPointer(event, axis) ?? startLayer
    const layers = layersForDrag({
      start: startLayer,
      end: endLayer,
      shiftKey: event.shiftKey,
      rotateKey: event.ctrlKey || event.metaKey,
    })

    const pointerId = this.pending.pointerId
    const startX = this.pending.startX
    const startY = this.pending.startY
    this.pending = null
    this.committed = { pointerId, startX, startY, axis, layers, screenDir: bestScreenDir, sign }

    this.renderer.orbitControls.enabled = false
    this.renderer.beginInteractiveTwist({ axis, layers })
  }

  /**
   * A drag starts as a single layer (or whatever the modifier asked for). If
   * the pointer then crosses onto another layer along the locked axis, that
   * layer joins the turn — smear onto the equator for a wide move, all the
   * way across for a rotation.
   */
  private growCommittedLayers(event: PointerEvent): void {
    const drag = this.committed
    if (!drag) return
    if (event.ctrlKey || event.metaKey) {
      const all: Coord[] = [-1, 0, 1]
      if (drag.layers.length < 3) {
        drag.layers = all
        this.renderer.expandInteractiveTwist({ axis: drag.axis, layers: all })
      }
      return
    }
    if (event.shiftKey && drag.layers.length === 1 && drag.layers[0] !== 0) {
      const next = expandLayers(drag.layers, 0)
      drag.layers = next
      this.renderer.expandInteractiveTwist({ axis: drag.axis, layers: next })
    }
    const layer = this.layerAtPointer(event, drag.axis)
    if (layer === null) return
    const next = expandLayers(drag.layers, layer)
    if (next.length === drag.layers.length) return
    drag.layers = next
    this.renderer.expandInteractiveTwist({ axis: drag.axis, layers: next })
  }

  private layerAtPointer(event: PointerEvent, axis: Axis): Coord | null {
    const ndc = this.toNdc(event)
    this.raycaster.setFromCamera(ndc, this.renderer.cameraInstance)
    const hit = this.raycaster.intersectObjects(this.renderer.rootGroup.children, true)[0]
    if (!hit?.object.parent) return null
    const world = hit.object.parent.getWorldPosition(new THREE.Vector3())
    return asCoord(world[axis])
  }

  private worldDirectionToScreen(worldDir: THREE.Vector3): THREE.Vector2 {
    const camera = this.renderer.cameraInstance
    const center = new THREE.Vector3(0, 0, 0).project(camera)
    const offset = worldDir.clone().multiplyScalar(0.1).project(camera)
    // Flip Y: NDC's +Y is up, but screen/client pixel coordinates' +Y is down.
    return new THREE.Vector2(offset.x - center.x, -(offset.y - center.y)).normalize()
  }
}

function axisVector(axis: Axis): THREE.Vector3 {
  if (axis === 'x') return new THREE.Vector3(1, 0, 0)
  if (axis === 'y') return new THREE.Vector3(0, 1, 0)
  return new THREE.Vector3(0, 0, 1)
}

function dominantAxis(v: THREE.Vector3): Axis | null {
  const ax = Math.abs(v.x)
  const ay = Math.abs(v.y)
  const az = Math.abs(v.z)
  if (ax >= ay && ax >= az && ax > 0.5) return 'x'
  if (ay >= ax && ay >= az && ay > 0.5) return 'y'
  if (az > 0.5) return 'z'
  return null
}

/** Rounds to the nearest quarter turn, snapping to 0 (cancel) if the drag didn't clear the snap-back fraction. */
function snapToQuarterTurns(angle: number): MoveSpec['quarterTurns'] | 0 {
  const quarterTurn = Math.PI / 2
  const turns = angle / quarterTurn
  const rounded = Math.round(turns)
  if (rounded === 0 && Math.abs(turns) < SNAP_BACK_FRACTION) return 0
  const clamped = Math.max(-2, Math.min(2, rounded === 0 ? Math.sign(turns) : rounded))
  return clamped as MoveSpec['quarterTurns']
}
