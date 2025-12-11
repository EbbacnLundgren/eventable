export {}

declare global {
  interface Window {
    THREE?: typeof import('three')
    VANTA?: {
      FOG?: (options: unknown) => { destroy: () => void }
    }
  }
}
