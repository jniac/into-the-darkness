import { Camera, Mesh, PlaneGeometry, Scene, ShaderMaterial, WebGLRenderer, WebGLRenderTarget } from 'three'
import { withRenderer } from './withRenderer'

const vertexShader = /* glsl */`
void main() {
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform sampler2D source;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = texture2D(source, uv);
}
`

const camera = new Camera()
const material = new ShaderMaterial({
  uniforms: {
    source: { value: null },
  },
  defines: {
    resolution: `vec2(1.0, 1.0})`
  },
  vertexShader,
  fragmentShader,
})

const plane = new Mesh(new PlaneGeometry(2, 2), material)
const scene = new Scene()
scene.add(plane)

export const copyTexture = (gl: WebGLRenderer, source: WebGLRenderTarget, destination: WebGLRenderTarget) => {
  material.uniforms.source.value = source.texture
  material.defines.resolution = `vec2(${source.width.toFixed(1)}, ${source.height.toFixed(1)})`
  material.needsUpdate = true
  withRenderer(gl, () => {
    gl.setRenderTarget(destination)
    gl.clear()
    gl.render(scene, camera)
  })
}
