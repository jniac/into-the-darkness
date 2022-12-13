import { WebGLRenderer } from 'three'

export const withRenderer = (renderer: WebGLRenderer, callback: () => void) => {
  const previousTarget = renderer.getRenderTarget()
  const previousXrEnabled = renderer.xr.enabled
  const previousShadowAutoUpdate = renderer.shadowMap.autoUpdate
  const previousOutputEncoding = renderer.outputEncoding
  const previousToneMapping = renderer.toneMapping
  
  callback()

  renderer.xr.enabled = previousXrEnabled
  renderer.shadowMap.autoUpdate = previousShadowAutoUpdate
  renderer.outputEncoding = previousOutputEncoding
  renderer.toneMapping = previousToneMapping
  renderer.setRenderTarget(previousTarget)
}
