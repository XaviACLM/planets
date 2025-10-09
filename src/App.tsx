import { useState, useEffect } from 'react'

import { Body, GeoVector } from "astronomy-engine";

import ZodiacWheel from './ZodiacWheel'
import { Node, NodeToBody, findAspects } from './astro.ts'


function App() {
	
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [showLabels, setShowLabels] = useState<boolean>(true);
	const [nodeAngles, setNodeAngles] = useState<Map<Node, number> | null>(null);
	
	
	const correct_for_aberration = true;
	
	// TODO find ascendant (position), lunar ascending, lunar descending
	// TODO menu on the side
	
	// compute positions
	// TODO compute aspects
	useEffect(() => {
		const tempNodeAngles = new Map<Node, number>();
		
		for ( const [node, body] of Object.entries(NodeToBody)) {
			const v = GeoVector(body, new Date(), correct_for_aberration);
			tempNodeAngles.set(node, Math.atan2(v.y, v.x));
		}
		
		setNodeAngles(tempNodeAngles);
	})
	
	
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
			
			<ZodiacWheel showLabels={showLabels} nodeAngles={nodeAngles}/>
			
		</div>
	)
}

export default App
