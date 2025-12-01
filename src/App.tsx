import { useState, useEffect, useMemo } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import ParallelDiagram from './ParallelDiagram'
import NodeSelector from './NodeSelector'
import { toZonedTime, fromZonedTime } from './util.ts'
import { HouseSystem } from './houses.ts'
import { findAspects, type Aspect } from './aspects.ts'
import { LunarNodeMode, AstrologyMode, Node } from './astroDefs.ts'
import { ZodiacPositions } from './astro.ts'
import { type CityData } from './CitySearchEngine'
import { CitySelector } from './CitySelector'

import "./App.css";

function App() {
	
	// config
	const [showLabels, setShowLabels] = useState<boolean>(true);
	const [flipText, setFlipText] = useState<boolean>(true);
	const [housePresweep, setHousePresweep] = useState<boolean>(false);
	const [rotateSymbols, setRotateSymbols] = useState<boolean>(false);
	const [lunarNodeMode, setLunarNodeMode] = useState<LunarNodeMode>(LunarNodeMode.MEAN);
	const [selectedHouseSystem, setSelectedHouseSystem] = useState<HouseSystem>(HouseSystem.PORPHYRY);
	const [selectedAstrologyMode, setSelectedAstrologyMode] = useState<AstrologyMode>(AstrologyMode.TROPICAL);

	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	
	const [selectedCity, setSelectedCity] = useState<CityData|null>(null);
	const [selectedDate, setSelectedDate] = useState(new Date());
	
	const [selectedNodes, setSelectedNodes] = useState<Set<Node>>(
		new Set([
			Node.SUN, Node.MOON, Node.MERCURY, Node.VENUS, Node.MARS,
			Node.JUPITER, Node.SATURN, Node.URANUS, Node.NEPTUNE, Node.PLUTO,
			Node.ASCENDANT, Node.DESCENDANT, Node.MIDHEAVEN, Node.IMUM_COELI,
			Node.LUNAR_ASCENDING, Node.LUNAR_APOGEE, Node.PART_OF_FORTUNE,
			Node.CERES, Node.ERIS
		])
	);
	
	//TODO a label if house system undefined for position

	const handleNodeToggle = (node: Node) => {
		setSelectedNodes(prev => {
		const newSet = new Set(prev);
		if (newSet.has(node)) {
			newSet.delete(node);
		} else {
			newSet.add(node);
		}
			return newSet;
		});
	};
	
	const [zodiacPositions, setZodiacPositions] = useState(ZodiacPositions.create(selectedDate, selectedCity, lunarNodeMode, selectedHouseSystem, selectedAstrologyMode));
	const [aspects, setAspects] = useState(findAspects(zodiacPositions.getNodePositions()));

	useEffect(() => {
		setAspects(findAspects(zodiacPositions.getNodePositions()));
	}, [zodiacPositions])
	
	useEffect(() => {
		setZodiacPositions(ZodiacPositions.create(selectedDate, selectedCity, lunarNodeMode, selectedHouseSystem, selectedAstrologyMode));
	}, [selectedCity, selectedDate])
	
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeHouseSystem(selectedHouseSystem));
	}, [selectedHouseSystem])
	
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeLunarNodeMode(lunarNodeMode));
	}, [lunarNodeMode])
	
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeAstrologyMode(selectedAstrologyMode));
	}, [selectedAstrologyMode])
	
	const currentTimezone = useMemo(() => {
		if (selectedCity === null) {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		}
		return selectedCity.timezone;
	}, [selectedCity]);
	
	// config options:
	//  that affect the zodiacWheel itself:
	//   a toggle for each and every node
	//  i'm not that sure - these affects aspects, but where will those end up living?
	//   for each aspect, a slider of how many physical nodes it needs to count
	//   a multi-toggle for each aspect: never - btw bodies - allow 1 point - allow any points w 1 body
	
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
					<input
						aria-label="Date and time"
						type="datetime-local" 
						style={{filter:"invert(1)", fontVariant: "small-caps"}}
						value={toZonedTime(selectedDate, currentTimezone).toISOString().slice(0, 16)}
						onChange={(e) => setSelectedDate(fromZonedTime(new Date(e.target.value), currentTimezone))}
					/>
				</div>
				<div className="module module-aspects">
					<div className="aspect-menu">
						<AspectMenu
							aspects={aspects}
							onHover={(aspect) => {setHighlightedAspect(aspect)}}
							onDelete={(aspect: Aspect) => setAspects(prev => prev.filter(a => a !== aspect))}
						/>
					</div>
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
						<div>
							<div className="checkbox-wrapper">
								<input
									type="checkbox"
									className="custom-checkbox"
									checked={showLabels}
									onChange={() => setShowLabels(!showLabels)}
									id="show-labels"
								/>
								<label htmlFor="show-labels">Show labels</label>
							</div>
							<hr/>
							<div className="checkbox-wrapper">
								<input
									type="checkbox"
									className="custom-checkbox"
									checked={flipText}
									onChange={() => setFlipText(!flipText)}
									id="flip-text"
								/>
								<label htmlFor="flip-text">Keep text right-side-up</label>
							</div>
							<hr/>
							<div className="checkbox-wrapper">
								<input
									type="checkbox"
									className="custom-checkbox"
									checked={housePresweep}
									onChange={() => setHousePresweep(!housePresweep)}
									id="pre-sweep"
								/>
								<label htmlFor="pre-sweep">House pre-sweep</label>
							</div>
							<hr/>
							<div className="checkbox-wrapper">
								<input
									type="checkbox"
									className="custom-checkbox"
									checked={rotateSymbols}
									onChange={() => setRotateSymbols(!rotateSymbols)}
									id="rotate-symbols"
								/>
								<label htmlFor="rotate-symbols">Rotate symbols</label>
							</div>
							<hr/>
							<div className="toggle-switch">
								<span>Lunar node  mode:</span>
								<button
									className={`toggle-option ${lunarNodeMode === LunarNodeMode.MEAN ? 'active' : ''}`}
									onClick={() => setLunarNodeMode(LunarNodeMode.MEAN)}
								>
									Mean
								</button>
								<button
									className={`toggle-option ${lunarNodeMode === LunarNodeMode.TRUE ? 'active' : ''}`}
									onClick={() => setLunarNodeMode(LunarNodeMode.TRUE)}
								>
									True
								</button>
							</div>
							<hr/>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<span>House system</span>
								<select
									value={selectedHouseSystem}
									onChange={(e) => setSelectedHouseSystem(e.target.value as HouseSystem)}
									style={{
										backgroundColor: "black",
										color: "white",
										border: "1px solid white",
										padding: "8px 12px",
										borderRadius: "4px",
										outline: "none",
									}}
								>
									{Object.values(HouseSystem).map(system =>(
										<option key={system} value={system}>
											{system}
										</option>
									))}
								</select>
							</div>
							<hr/>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<span>Mode</span>
								<select
									value={selectedAstrologyMode}
									onChange={(e) => setSelectedAstrologyMode(e.target.value as AstrologyMode)}
									style={{
										backgroundColor: "black",
										color: "white",
										border: "1px solid white",
										padding: "8px 12px",
										borderRadius: "4px",
										outline: "none",
									}}
								>
									{Object.values(AstrologyMode).map(system =>(
										<option key={system} value={system}>
											{system}
										</option>
									))}
								</select>
							</div>
						</div>
					)}
				</div>
				<ZodiacWheel
					showLabels={showLabels}
					flipText={flipText}
					housePresweep={housePresweep}
					rotateSymbols={rotateSymbols}
					zodiacPositions={zodiacPositions}
					selectedNodes={selectedNodes}
					aspects={aspects}
					highlightedAspect={highlightedAspect}
				/>
				
				{zodiacPositions.houseSystemUndefinedForPosition() && 
					<div className="house-system-warning">
						<span>
							Selected house system ({selectedHouseSystem}) is not defined for the selected time and location.{" "}
							<button
								onClick={() => setSelectedHouseSystem(HouseSystem.TOPOCENTRIC)}
								className="switch-house-system-button"
							>
								Switch to Topocentric
							</button>
						</span>
					</div>
				}
				
			</main>
			
			<aside className="sidebar right-sidebar">
				<div className="module">
					<ParallelDiagram
						showLabels={showLabels}
						zodiacPositions={zodiacPositions}
						selectedNodes={selectedNodes}
						aspects={aspects}
						highlightedAspect={highlightedAspect}
					/>
				</div>
				<div className="module">
					<NodeSelector
						selectedNodes={selectedNodes}
						onNodeToggle={handleNodeToggle}
						showLabels={showLabels}
					/>
				</div>
			</aside>
		</div>
	)
	
}

export default App
