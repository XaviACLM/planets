import { useState, useEffect } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import { Node, NodeToBody, findAspects, type Aspect, getNodePositions, getNodePositionsWithoutLocation } from './astro.ts'
import { type SearchResult, CitySearchEngine } from './CitySearchEngine.ts'
import { type CityData, barcelonaCityData } from './CitySearchEngine'
import { CitySelector } from './CitySelector'

import "./App.css";


function App() {
	
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [showLabels, setShowLabels] = useState<boolean>(true);
	const [nodeAngles, setNodeAngles] = useState<Map<Node, number> | null>(null);
	const [aspects, setAspects] = useState<Aspect[] | null>(null);
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	const [selectedCity, setSelectedCity] = useState<cityData|null>(null); //null
	
	useEffect(() => {
		const date = new Date();
		
		const latitudeDeg = 41.3874;
		const longitudeDeg = 2.1686;
		
		let tempNodeAngles;
		if (selectedCity != null) {
			tempNodeAngles = getNodePositions(date, selectedCity.latitude, selectedCity.longitude);
		} else {
			tempNodeAngles = getNodePositionsWithoutLocation(date);
			console.log(tempNodeAngles);
		}
		const tempAspects = findAspects(tempNodeAngles);
		
		setNodeAngles(tempNodeAngles);
		setAspects(tempAspects);
	}, [selectedCity]);
	
	return (
		<div className="app-container">
			<aside className="sidebar left-sidebar">
				<div className="module">
					<CitySelector
						startingQueryText={selectedCity}
						onSelect={(city) => {
							setSelectedCity(city);
						}}
					/>
				</div>
				<div className="module module-aspects">
					<div className="aspect-menu">
						<AspectMenu
							aspects={aspects}
							onHover={(aspect) => {setHighlightedAspect(aspect)}}
							onDelete={(aspect) => setAspects(prev => prev.filter(a => a !== aspect))}
						/>
					</div>
				</div>
				<div className="module">
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
					Left module 3
				</div>
			</aside>
			
			<main className="wheel-area">
				<div className="floating-menu">
					<button className="floating-menu-button"
						onClick = {() => {setMenuOpen(!menuOpen)}}
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
			</main>
			
			<aside className="sidebar right-sidebar">
				<div className="module">Right module 1</div>
				<div className="module">Right module 2</div>
			</aside>
		</div>
	)
	
}

export default App
