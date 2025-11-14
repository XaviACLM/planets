import { useState, useEffect, useMemo } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import { findAspects, type Aspect } from './aspects.ts'
import { HouseSystem, LunarNodeMode, ZodiacPositions } from './astro.ts'
import { type SearchResult, CitySearchEngine } from './CitySearchEngine.ts'
import { type CityData, barcelonaCityData } from './CitySearchEngine'
import { CitySelector } from './CitySelector'

import "./App.css";


function App() {
	
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [showLabels, setShowLabels] = useState<boolean>(true);
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	const [selectedCity, setSelectedCity] = useState<cityData|null>(null); //null
	
	// keeps zodiacPositions (from the stuff we're doing over at astro2)
	// and something from config
	// zodiacPositions always knows where EVERY node is, selected or not
	//  except for the location-dependent ones, if location is null
	//  updatable: lunar nodes might change btw true/mean, house cusps depend on house system
	//  also updated if date or location changes
	
	// config options:
	//  that affect node positions in zodiacPositions:
	//   true/mean (geometric/meeus) lunar nodes
	//   house system
	//  that affect the zodiacWheel itself:
	//   a toggle for each and every node
	//  i'm not that sure - these affects aspects, but where will those end up living?
	//   for each aspect, a slider of how many physical nodes it needs to count
	//   a multi-toggle for each aspect: never - btw bodies - allow 1 point - allow any points w 1 body
	
	// from zodiacPositions and the config (that affects zodiacWheel)
	// useMemo -> nodePositions, bodyNodes[], pointNodes[]
	// within zodiacWheel, keep the useMemo -> adjustedNodePositions
	
	const { zodiacPositions, aspects } = useMemo<Map<Node, number> | null>(() => {
		const date = new Date();
		
		let zodiacPositions;
		let tempNodeAngles;
		if (selectedCity != null) {
			zodiacPositions = ZodiacPositions.create(date, selectedCity, LunarNodeMode.MEAN, HouseSystem.PLACIDUS);
		} else {
			zodiacPositions = ZodiacPositions.create(date, null, LunarNodeMode.MEAN, HouseSystem.PLACIDUS);
		}
		const tempAspects = findAspects(zodiacPositions._nodePositions);
		
		return {
			zodiacPositions: zodiacPositions,
			aspects: tempAspects
		}
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
					zodiacPositions={zodiacPositions}
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
