import { useState, useEffect, useMemo } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import ParallelDiagram from './ParallelDiagram'
import Slider from './Slider'
import NumericInputField from './NumericInputField'
import { NodeSelector, AspectKindSelector } from './CategorySelector.tsx'
import { toZonedTime, fromZonedTime } from './util.ts'
import { HouseSystem } from './houses.ts'
import { findAspects, type Aspect, filterAspects, formatAspects, flattenSubaspectsToList, deleteAspectFromMap } from './aspects.ts'
import { LunarNodeMode, AstrologyMode, Node, HamburgSchoolMode, defaultNodes, AspectKind, defaultAspectKinds, AspectPhysicalityFilter, AspectMenuMode, AspectErrorMode } from './astroDefs.ts'
import { ZodiacPositions } from './astro.ts'
import { type CityData } from './CitySearchEngine'
import { CitySelector } from './CitySelector'

import "./App.css";

function App() {
	
	// settings
	const [selectedHouseSystem, setSelectedHouseSystem] = useState<HouseSystem>(HouseSystem.PLACIDUS);
	const [housePresweep, setHousePresweep] = useState<boolean>(false);
	
	const [showAspectLabels, setShowAspectLabels] = useState<boolean>(false);
	const [showNodeLabels, setShowNodeLabels] = useState<boolean>(true);
	const [showSymbolLabels, setShowSymbolLabels] = useState<boolean>(true);
	
	const [flipText, setFlipText] = useState<boolean>(true);
	const [rotateSymbols, setRotateSymbols] = useState<boolean>(false);
	const [aspectsColorcoded, setAspectsColorcoded] = useState<boolean>(false);
	
	const [aspectPhysicalityFilter, setAspectPhysicalityFilter] = useState<AspectPhysicalityFilter>(AspectPhysicalityFilter.ALL_BUT_ONE_PHYSICAL);
	const [hamburgPhysical, setHamburgPhysical] = useState<boolean>(false);
	const [selectedAspectMenuMode, setSelectedAspectMenuMode] = useState<AspectMenuMode>(AspectMenuMode.SHOW_MAXIMAL_WITH_SUBMENUS);
	const [selectedAspectErrorMode, setSelectedAspectErrorMode] = useState<AspectErrorMode>(AspectErrorMode.POINTWISE_SUM);
	
	const [lunarNodeMode, setLunarNodeMode] = useState<LunarNodeMode>(LunarNodeMode.MEAN);
	const [hamburgSchoolMode, setHamburgSchoolMode] = useState<HamburgSchoolMode>(HamburgSchoolMode.NEELY);
	const [selectedAstrologyMode, setSelectedAstrologyMode] = useState<AstrologyMode>(AstrologyMode.TROPICAL);


	const [selectedCity, setSelectedCity] = useState<CityData|null>(null);
	const [selectedDate, setSelectedDate] = useState(new Date());
	
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	
	const [selectedNodes, setSelectedNodes] = useState<Set<Node>>(new Set( defaultNodes ));
	const [selectedAspectKinds, setSelectedAspectKinds] = useState<Set<AspectKind>>(new Set( defaultAspectKinds ));
	
    const [zodiacPositions, setZodiacPositions] = useState(ZodiacPositions.create(selectedDate, selectedCity, lunarNodeMode, selectedHouseSystem, selectedAstrologyMode));
	
	// fullAspects is the whole thing
	// filteredAspects is the filtered thing, but by ref it is also the first thing
	// ...so it's wrong.
	// okay
	// TODO make it so that filterAspects and formatAspects do memcpy
	// this fucking sucks. this is a piece of shit. this is some of the shittiest logic i've designed.
	// then we have fullAspects -> filteredAspects
	// filteredAspects -> formattedAspects, flattenedAspects
	// these last two are useStates.
	// which fucking sucks. again. it fucking sucks.
	// you know what? flattenedAspects is actually just an useMemo of formattedAspects. fuck you. i don't need to care. fuck you.
	
	// all aspects of all kinds from all nodes
	const fullAspects = useMemo(() => {
		return findAspects(zodiacPositions.getNodePositions(), selectedAspectErrorMode);
	}, [zodiacPositions, selectedAspectErrorMode]);
	
	// aspects restricted to only selected kinds/nodes w/ sufficient physical nodes
	const filteredAspects = useMemo(() => {
		return filterAspects(fullAspects, zodiacPositions.getNodePositions(), selectedNodes, selectedAspectKinds, aspectPhysicalityFilter, hamburgPhysical);
	}, [fullAspects, selectedNodes, selectedAspectKinds, aspectPhysicalityFilter, hamburgPhysical]);

	// aspects, filtered, in the format imposed by the selected aspect menu mode
	const [aspects, setAspects] = useState<Aspect>(formatAspects(filteredAspects, selectedAspectMenuMode));
	useEffect(() => {
		return setAspects(formatAspects(filteredAspects, selectedAspectMenuMode));
	}, [filteredAspects, selectedAspectMenuMode])
	
	// aspects, flattened down to a single list for processing in UI components
	// (this might be possible to do w/ enforced redundancy but unnecessary and much too complicated, even considering the above)
	const flattenedAspects = useMemo(() => {
		return flattenSubaspectsToList(aspects)
	}, [aspects])
	
	// recompute zodiac whenever date or time changes
	useEffect(() => {
		setZodiacPositions(ZodiacPositions.create(selectedDate, selectedCity, lunarNodeMode, selectedHouseSystem, selectedAstrologyMode, hamburgSchoolMode));
	}, [selectedCity, selectedDate])
	
	// handlers for changing config details in the zodiac positions that only require partial recomputation
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeHouseSystem(selectedHouseSystem));
	}, [selectedHouseSystem])
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeLunarNodeMode(lunarNodeMode));
	}, [lunarNodeMode])
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeAstrologyMode(selectedAstrologyMode));
	}, [selectedAstrologyMode])
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeHamburgSchoolMode(hamburgSchoolMode));
	}, [hamburgSchoolMode])
	
	const currentTimezone = useMemo(() => {
		if (selectedCity === null) {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		}
		return selectedCity.timezone;
	}, [selectedCity]);
	
	const showParallelDiagram = useMemo(() => {
		return selectedAspectKinds.has(AspectKind.PARALLEL) || selectedAspectKinds.has(AspectKind.CONTRAPARALLEL);
	}, [selectedAspectKinds])
	
	function handleAspectDeletion(aspect: Aspect, parentAspect: Aspect | null){
		setAspects(deleteAspectFromMap(aspects, aspect, parentAspect));
	}
	
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
							showAspectLabels={showAspectLabels}
							aspectsColorcoded={aspectsColorcoded}
							onHover={(aspect) => {setHighlightedAspect(aspect)}}
							onDelete={handleAspectDeletion}
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
									checked={showAspectLabels}
									onChange={() => setShowAspectLabels(!showAspectLabels)}
									id="show-aspect-labels"
								/>
								<label htmlFor="show-aspect-labels">Show aspect labels</label>
							</div>
							<br/>
							<div className="checkbox-wrapper">
								<input
									type="checkbox"
									className="custom-checkbox"
									checked={showNodeLabels}
									onChange={() => setShowNodeLabels(!showNodeLabels)}
									id="show-node-labels"
								/>
								<label htmlFor="show-node-labels">Show node labels</label>
							</div>
							<br/>
							<div className="checkbox-wrapper">
								<input
									type="checkbox"
									className="custom-checkbox"
									checked={showSymbolLabels}
									onChange={() => setShowSymbolLabels(!showSymbolLabels)}
									id="show-symbol-labels"
								/>
								<label htmlFor="show-symbol-labels">Show zodiac symbol labels</label>
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
							<br/>
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
							<br/>
							<div className="checkbox-wrapper">
								<input
									type="checkbox"
									className="custom-checkbox"
									checked={aspectsColorcoded}
									onChange={() => setAspectsColorcoded(!aspectsColorcoded)}
									id="aspects-colorcoded"
								/>
								<label htmlFor="aspects-colorcoded">Colorcode aspects</label>
							</div>
							
							<hr/>
							
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<span>Configuration error</span>
								<select
									value={selectedAspectErrorMode}
									onChange={(e) => setSelectedAspectErrorMode(e.target.value as AspectErrorMode)}
									style={{
										backgroundColor: "black",
										color: "white",
										border: "1px solid white",
										padding: "8px 12px",
										borderRadius: "4px",
										outline: "none",
									}}
								>
									{Object.values(AspectErrorMode).map(system =>(
										<option key={system} value={system}>
											{system}
										</option>
									))}
								</select>
							</div>
							Maximum error per aspect type:
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								- Configurations:
								<div style={{maxWidth:'50px'}}>
									<NumericInputField
										min={0}
										max={20}
										initialValue={3}
										onValidCommit={x => {console.log(x);}}
										placeholder="Error"
										unit={"º"}
									/>
								</div>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								- Major binary aspects:
								<div style={{maxWidth:'50px'}}>
									<NumericInputField
										min={0}
										max={20}
										initialValue={3}
										onValidCommit={x => {console.log(x);}}
										placeholder="Error"
										unit={"º"}
									/>
								</div>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								- Minor binary aspects:
								<div style={{maxWidth:'50px'}}>
									<NumericInputField
										min={0}
										max={20}
										initialValue={3}
										onValidCommit={x => {console.log(x);}}
										placeholder="Error"
										unit={"º"}
									/>
								</div>
							</div>
							
							<hr/>
							
							Required # of physical nodes per aspect:
							<Slider
								options={Object.values(AspectPhysicalityFilter)}
								labels={AspectPhysicalityFilter}
								value={aspectPhysicalityFilter}
								onChange={setAspectPhysicalityFilter}
							/>
							<br/>
							<div className="checkbox-wrapper">
								<input
									type="checkbox"
									className="custom-checkbox"
									checked={hamburgPhysical}
									onChange={() => setHamburgPhysical(!hamburgPhysical)}
									id="hamburg-physical"
								/>
								<label htmlFor="hamburg-physical">Hamburg objects considered physical</label>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<span>Display aspects</span>
								<select
									value={selectedAspectMenuMode}
									onChange={(e) => setSelectedAspectMenuMode(e.target.value as AspectMenuMode)}
									style={{
										backgroundColor: "black",
										color: "white",
										border: "1px solid white",
										padding: "8px 12px",
										borderRadius: "4px",
										outline: "none",
									}}
								>
									{Object.values(AspectMenuMode).map(system =>(
										<option key={system} value={system}>
											{system}
										</option>
									))}
								</select>
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
							<div className="toggle-switch">
								<span>Hamburg school params:</span>
								<button
									className={`toggle-option ${hamburgSchoolMode === HamburgSchoolMode.WITTE ? 'active' : ''}`}
									onClick={() => setHamburgSchoolMode(HamburgSchoolMode.WITTE)}
								>
									Witte
								</button>
								<button
									className={`toggle-option ${hamburgSchoolMode === HamburgSchoolMode.NEELY ? 'active' : ''}`}
									onClick={() => setHamburgSchoolMode(HamburgSchoolMode.NEELY)}
								>
									Neely
								</button>
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
					showNodeLabels={showNodeLabels}
					showSymbolLabels={showSymbolLabels}
					flipText={flipText}
					housePresweep={housePresweep}
					rotateSymbols={rotateSymbols}
					aspectsColorcoded={aspectsColorcoded}
					zodiacPositions={zodiacPositions}
					selectedNodes={selectedNodes}
					aspects={flattenedAspects}
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
				{ showParallelDiagram && 
					<div className="module">
						<ParallelDiagram
							showNodeLabels={showNodeLabels}
							zodiacPositions={zodiacPositions}
							selectedNodes={selectedNodes}
							aspects={flattenedAspects}
							highlightedAspect={highlightedAspect}
						/>
					</div>
				}
				<div className="module">
					<NodeSelector
						selectedItems={selectedNodes}
						setSelectedItems={setSelectedNodes}
						showLabels={showNodeLabels}
					/>
				</div>
				<div className="module">
					<AspectKindSelector
						selectedItems={selectedAspectKinds}
						setSelectedItems={setSelectedAspectKinds}
						showLabels={showAspectLabels}
					/>
				</div>
			</aside>
		</div>
	)
	
}

export default App
