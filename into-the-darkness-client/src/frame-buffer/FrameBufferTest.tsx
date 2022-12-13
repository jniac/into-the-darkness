import { useThree } from '@react-three/fiber'
import { timer, useEffects } from 'some-utils/npm/react'
import { BufferGeometry, Camera, LinearEncoding, Mesh, MeshBasicMaterial, NearestFilter, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector4, WebGLRenderer, WebGLRenderTarget } from 'three'
import { copyTexture } from './copyTexture'
import { withRenderer } from './withRenderer'

const vertexShader = /* glsl */`
void main() {
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */`
const vec3 white = vec3(1.0);
const vec3 red = vec3(1.0, 0.0, 0.0);
const vec3 blue = vec3(0.0, 0.0, 1.0);
float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
uniform float uTime;
uniform vec4 uRandom;
uniform sampler2D previous;
vec4 getTexel(vec2 coord) {
  vec2 uv = coord / resolution.xy;
  return texture2D(previous, uv);
}
bool equivalent(float a, float b) {
  return abs(b - a) < 1e-6;
}
bool equivalent(vec2 a, vec2 b) {
  return abs(b.x - a.x) < 1e-6 && abs(b.y - a.y) < 1e-6;
}
bool equivalent(vec3 a, vec3 b) {
  return abs(b.x - a.x) < 1e-6 && abs(b.y - a.y) < 1e-6 && abs(b.z - a.z) < 1e-6;
}
void main() {
  gl_FragColor.a = 1.0;

  vec4 txM = getTexel(gl_FragCoord.xy);
  vec4 txR = getTexel(gl_FragCoord.xy - vec2(1.0, 0.0));
  vec4 txL = getTexel(gl_FragCoord.xy + vec2(1.0, 0.0));
  vec4 txB = getTexel(gl_FragCoord.xy - vec2(0.0, 1.0));
  vec4 txU = getTexel(gl_FragCoord.xy + vec2(0.0, 1.0));

  // do nothing
  if (equivalent(txM.rgb, vec3(1.0))) {
    gl_FragColor.rgb = txM.rgb;
    return;
  }

  if (equivalent(floor(gl_FragCoord.xy), resolution / 2.0)) {
    gl_FragColor.rgb = vec3(1.0);
    return;
  }

  bool grow = (
    equivalent(txR.r, 1.0) ||
    equivalent(txL.r, 1.0) ||
    equivalent(txB.r, 1.0) ||
    equivalent(txU.r, 1.0));

  if (grow) {
    float n = rand(gl_FragCoord.xy + uRandom.xy * 1000.0);
    // gl_FragColor.rgb = n < 0.6 ? white : blue;
    gl_FragColor.rgb = n < 0.58 ? white : blue;
    return;
  }
}
`

const getFlipflop = ({ x = 512, y = 512 }: Partial<Vector2>) => {
  const write = new WebGLRenderTarget(x, y)
  write.texture.minFilter = NearestFilter
  write.texture.magFilter = NearestFilter
  write.texture.encoding = LinearEncoding
  const read = new WebGLRenderTarget(x, y)
  read.texture.minFilter = NearestFilter
  read.texture.magFilter = NearestFilter
  read.texture.encoding = LinearEncoding
  const copy = (gl: WebGLRenderer) => {
    copyTexture(gl, write, read)
  }
  return {
    write,
    read,
    copy,
  }
}

export const FrameBufferTest = () => {
  const gl = useThree().gl
  const { ref } = useEffects<Mesh<BufferGeometry, MeshBasicMaterial>>(function* (mesh) {
    const camera = new Camera()
    camera.position.z = 1
    const size = new Vector2(1024, 1024)
    const flipflop = getFlipflop(size)
    const geometry = new PlaneGeometry(2, 2)
    const { uTime } = timer
    const material = new ShaderMaterial({
      uniforms: {
        uTime,
        uRandom: { value: new Vector4(Math.random(), Math.random(), Math.random(), Math.random()) },
      },
      defines: {
        resolution: `vec2(${size.x.toFixed(1)}, ${size.y.toFixed(1)})`
      },
      vertexShader,
      fragmentShader,
    })
    const plane = new Mesh(geometry, material)
    const scene = new Scene()
    scene.add(plane)
    yield timer.onFrame(() => {
      withRenderer(gl, () => {
        gl.setRenderTarget(flipflop.write)
        gl.clear()
        gl.render(scene, camera)
        flipflop.copy(gl)
      })
    })
    mesh.material.map = flipflop.read.texture
  }, [])
  
  return (
    <mesh ref={ref}>
      <planeGeometry args={[16, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}
