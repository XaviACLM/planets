import { useState, useEffect } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import { Node, NodeToBody, findAspects, type Aspect, getNodePositions } from './astro.ts'

import "./App.css";

function App() {
	
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [showLabels, setShowLabels] = useState<boolean>(true);
	const [nodeAngles, setNodeAngles] = useState<Map<Node, number> | null>(null);
	const [aspects, setAspects] = useState<Aspect[] | null>(null);
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	
	const correct_for_aberration = true;

	useEffect(() => {
		const date = new Date();
		
		const latitudeDeg = 41.3874;
		const longitudeDeg = 2.1686;
		
		const tempNodeAngles = getNodePositions(date, latitudeDeg, longitudeDeg);
		const tempAspects = findAspects(tempNodeAngles);
		
		setNodeAngles(tempNodeAngles);
		setAspects(tempAspects);
	}, []);
	
	return (
		<div className="app-container" style={{ position: "relative", height: "100vh" }}>
			<div className="sidebar">
				<AspectMenu
					aspects={aspects}
					onHover={(aspect) => {setHighlightedAspect(aspect)}}
					onDelete={(aspect) => setAspects(prev => prev.filter(a => a !== aspect))}
				/>
			</div>
			<div className="wheel-area">
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
			
				<ZodiacWheel
					showLabels={showLabels}
					nodeAngles={nodeAngles}
					aspects={aspects}
				highlightedAspect={highlightedAspect}
				/>
			</div>
			
		</div>
	)
}

export default App
