import type { LessonStep, Method } from '../types'
import { beginnerMethod } from './beginner'
import { cfopMethod } from './cfop/method'
import { rouxMethod } from './roux/method'
import { zzMethod } from './zz/method'

export const methods: Method[] = [beginnerMethod, cfopMethod, rouxMethod, zzMethod]

export const methodsById: Record<string, Method> = Object.fromEntries(methods.map((method) => [method.id, method]))

export function methodById(id: string): Method {
  const method = methodsById[id]
  if (!method) throw new Error(`Unknown method: "${id}"`)
  return method
}

export function stepById(method: Method, stepId: string): LessonStep {
  const step = method.steps.find((entry) => entry.id === stepId)
  if (!step) throw new Error(`Unknown step "${stepId}" on ${method.id}`)
  return step
}

export function adjacentSteps(method: Method, stepId: string): { prev?: LessonStep; next?: LessonStep } {
  const index = method.steps.findIndex((step) => step.id === stepId)
  return {
    prev: index > 0 ? method.steps[index - 1] : undefined,
    next: index >= 0 && index < method.steps.length - 1 ? method.steps[index + 1] : undefined,
  }
}

export function firstIncompleteStep(method: Method, completedLessons: string[]): LessonStep | undefined {
  return method.steps.find((step) => !completedLessons.includes(step.id)) ?? method.steps[0]
}
