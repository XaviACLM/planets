import { useState } from 'react'
import ZodiacWheel from './ZodiacWheel'

function App() {
	
	const [menuOpen, setMenuOpen] = useState(false);
	const [showLabels, setShowLabels] = useState(true);
	
	return (
		<div style={{ position: "relative", height: "100vh" }}>
			<div
				style={{
					position: "absolute",
					top: "1rem",
					right: "1rem",
					background: "black",
					padding: "0.5rem",
					color: "white",
					border: "1px solid white",
					borderRadius: "0.5rem"
				}}
			>
				<button
					onClick = {() => {setMenuOpen(!menuOpen)}}
					style={{
						//position:"absolute",
						top: "0rem",
						right: "0rem",
						color: "white",
						background: "black",
					}}
				>
					☰
				</button>
				
				{menuOpen && (
					<label>
						<input
							type="checkbox"
							checked={showLabels}
							onChange={() => setShowLabels(!showLabels)}
						/>
						Show labels
					</label>
				)}
			</div>
			<ZodiacWheel />
			
		</div>
	)
}

export default App
