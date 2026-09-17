import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:test') })
Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn() })
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: vi.fn(() => null) })
afterEach(() => cleanup())
