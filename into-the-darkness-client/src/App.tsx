import { Canvas } from '@react-three/fiber'
import { RenderFrame } from 'some-utils/npm/@react-three'
import { TimeIndicator } from 'some-utils/npm/react'
import { FrameBufferTest } from './frame-buffer/FrameBufferTest'
import './App.css'

export const App = () => {
  return (
    <div className='App'>
      <TimeIndicator />
      <Canvas frameloop='never' flat>
        <RenderFrame timeBeforeFade={30} />

        <ambientLight intensity={.5} />
        <directionalLight intensity={.5} position={[3, 6, 2]} />

        <FrameBufferTest />
      </Canvas>
    </div>
  )
}
