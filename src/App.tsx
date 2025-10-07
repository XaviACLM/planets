import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Clock from './Clock'
import ZodiacWheel from './ZodiacWheel'

function App() {
  const [count, setCount] = useState(0)

  return (
	  <ZodiacWheel />
  )
}

export default App
