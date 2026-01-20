import { useState, useEffect, useMemo } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import DominanceChart from './DominanceChart'
import RulershipPanel from './RulershipPanel'
import EsotericModePanel from './EsotericModePanel'
import SettingsMenu from './SettingsMenu'
import { NodeSelector, AspectKindSelector } from './CategorySelector.tsx'
import { toZonedTime, fromZonedTime } from './util.ts'
import { HouseSystem } from './houses.ts'
import { findAspects, type Aspect, filterAspects, formatAspects, flattenSubaspectsToList, deleteAspectFromMap } from './aspects.ts'
import { LunarNodeMode, AstrologyMode, HamburgSchoolMode, AspectPhysicalityFilter, AspectMenuMode, AspectErrorMode, RulershipMode } from './astroDefs.ts'
import { ZodiacPositions } from './astro.ts'
import { type CityData } from './CitySearchEngine'
import { CitySelector } from './CitySelector'
import { useSettingsStore } from './settingsStore.ts'

import "./App.css";

function App() {

	const selectedHouseSystem = useSettingsStore(s => s.selectedHouseSystem);
	const setSelectedHouseSystem = useSettingsStore(s => s.setSelectedHouseSystem);
	const housePresweep = useSettingsStore(s => s.housePresweep);
	const setHousePresweep = useSettingsStore(s => s.setHousePresweep);

	const showAspectLabels = useSettingsStore(s => s.showAspectLabels);
	const setShowAspectLabels = useSettingsStore(s => s.setShowAspectLabels);
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const setShowNodeLabels = useSettingsStore(s => s.setShowNodeLabels);
	const showSymbolLabels = useSettingsStore(s => s.showSymbolLabels);
	const setShowSymbolLabels = useSettingsStore(s => s.setShowSymbolLabels);
	const showElementLabels = useSettingsStore(s => s.showElementLabels);
	const setShowElementLabels = useSettingsStore(s => s.setShowElementLabels);
	const showModeLabels = useSettingsStore(s => s.showModeLabels);
	const setShowModeLabels = useSettingsStore(s => s.setShowModeLabels);

	const flipText = useSettingsStore(s => s.flipText);
	const setFlipText = useSettingsStore(s => s.setFlipText);
	const rotateSymbols = useSettingsStore(s => s.rotateSymbols);
	const setRotateSymbols = useSettingsStore(s => s.setRotateSymbols);
	const aspectsColorcoded = useSettingsStore(s => s.aspectsColorcoded);
	const setAspectsColorcoded = useSettingsStore(s => s.setAspectsColorcoded);
	const showSignsInRulershipPanel = useSettingsStore(s => s.showSignsInRulershipPanel);
	const setShowSignsInRulershipPanel = useSettingsStore(s => s.setShowSignsInRulershipPanel);

	const selectedAspectErrorMode = useSettingsStore(s => s.selectedAspectErrorMode);
	const setSelectedAspectErrorMode = useSettingsStore(s => s.setSelectedAspectErrorMode);
	const maxConfigurationErrorDegrees = useSettingsStore(s => s.maxConfigurationErrorDegrees);
	const setMaxConfigurationErrorDegrees = useSettingsStore(s => s.setMaxConfigurationErrorDegrees);
	const maxMajorBAErrorDegrees = useSettingsStore(s => s.maxMajorBAErrorDegrees);
	const setMaxMajorBAErrorDegrees = useSettingsStore(s => s.setMaxMajorBAErrorDegrees);
	const maxMinorBAErrorDegrees = useSettingsStore(s => s.maxMinorBAErrorDegrees);
	const setMaxMinorBAErrorDegrees = useSettingsStore(s => s.setMaxMinorBAErrorDegrees);
	const maxConfigurationError = useMemo(() => maxConfigurationErrorDegrees*Math.PI/180, [maxConfigurationErrorDegrees]);
	const maxMajorBAError = useMemo(() => maxMajorBAErrorDegrees*Math.PI/180, [maxMajorBAErrorDegrees]);
	const maxMinorBAError = useMemo(() => maxMinorBAErrorDegrees*Math.PI/180, [maxMinorBAErrorDegrees]);

	const aspectPhysicalityFilter = useSettingsStore(s => s.aspectPhysicalityFilter);
	const setAspectPhysicalityFilter = useSettingsStore(s => s.setAspectPhysicalityFilter);
	const hamburgPhysical = useSettingsStore(s => s.hamburgPhysical);
	const setHamburgPhysical = useSettingsStore(s => s.setHamburgPhysical);
	const selectedAspectMenuMode = useSettingsStore(s => s.selectedAspectMenuMode);
	const setSelectedAspectMenuMode = useSettingsStore(s => s.setSelectedAspectMenuMode);

	const lunarNodeMode = useSettingsStore(s => s.lunarNodeMode);
	const setLunarNodeMode = useSettingsStore(s => s.setLunarNodeMode);
	const hamburgSchoolMode = useSettingsStore(s => s.hamburgSchoolMode);
	const setHamburgSchoolMode = useSettingsStore(s => s.setHamburgSchoolMode);
	const selectedAstrologyMode = useSettingsStore(s => s.selectedAstrologyMode);
	const setSelectedAstrologyMode = useSettingsStore(s => s.setSelectedAstrologyMode);
	const selectedRulershipMode = useSettingsStore(s => s.selectedRulershipMode);
	const setSelectedRulershipMode = useSettingsStore(s => s.setSelectedRulershipMode);

	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	const setSelectedNodes = useSettingsStore(s => s.setSelectedNodes);
	const selectedAspectKinds = useSettingsStore(s => s.selectedAspectKinds);
	const setSelectedAspectKinds = useSettingsStore(s => s.setSelectedAspectKinds);

	// Local state (not settings)
	const [selectedCity, setSelectedCity] = useState<CityData|null>(null);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	
    const [zodiacPositions, setZodiacPositions] = useState(ZodiacPositions.create(selectedDate, selectedCity, lunarNodeMode, selectedHouseSystem, selectedAstrologyMode, hamburgSchoolMode));
	
	// all aspects of all kinds from all nodes
	const fullAspects = useMemo(() => {
		return findAspects(zodiacPositions.getNodePositions(), selectedAspectErrorMode, maxConfigurationError, maxMajorBAError, maxMinorBAError);
	}, [zodiacPositions, selectedAspectErrorMode, maxConfigurationError, maxMajorBAError, maxMinorBAError]);
	
	// aspects restricted to only selected kinds/nodes w/ sufficient physical nodes
	const filteredAspects = useMemo(() => {
		return filterAspects(
			fullAspects,
			zodiacPositions.getNodePositions(),
			selectedNodes,
			selectedAspectKinds,
			aspectPhysicalityFilter,
			hamburgPhysical,
			selectedAspectErrorMode,
			maxConfigurationError,
			maxMajorBAError,
			maxMinorBAError
		);
		// note that errors or error mode are not in dependencies list
		// any change fullAspects recomputation which will force filteredAspects recomputation anyway
	}, [fullAspects, selectedNodes, selectedAspectKinds, aspectPhysicalityFilter, hamburgPhysical]);

	// aspects, filtered, in the format imposed by the selected aspect menu mode
	const [aspects, setAspects] = useState<Map<Aspect, Aspect[]>>(formatAspects(filteredAspects, selectedAspectMenuMode));
	useEffect(() => {
		setAspects(formatAspects(filteredAspects, selectedAspectMenuMode));
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
				<EsotericModePanel
					setShowNodeLabels={setShowNodeLabels}
					setShowSymbolLabels={setShowSymbolLabels}
					setShowElementLabels={setShowElementLabels}
					setShowModeLabels={setShowModeLabels}
					setShowSignsInRulershipPanel={setShowSignsInRulershipPanel}
				/>
				<button
					className="floating-menu-button"
					onClick={() => setMenuOpen(!menuOpen)}
				>
					{menuOpen ? '✕' : '☰'}
				</button>
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
								onClick={() => setSelectedHouseSystem(HouseSystem.PORPHYRY)}
								className="switch-house-system-button"
							>
								Switch to Porphyry
							</button>
						</span>
					</div>
				}
				
			</main>
			
			<aside className="sidebar right-sidebar">
				<div className="sidebar-content" key={menuOpen ? 'settings' : 'main'}>
					{menuOpen ? (
						<>
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
							<div className="module">
								<SettingsMenu />
							</div>
						</>
					) : (
						<>
							<div className="module">
								<DominanceChart
									zodiacPositions={zodiacPositions}
									showNodeLabels={showNodeLabels}
									showElementLabels={showElementLabels}
									showModeLabels={showModeLabels}
								/>
							</div>
							<div className="module">
								<RulershipPanel
									zodiacPositions={zodiacPositions}
									rulershipMode={selectedRulershipMode}
									showNodeLabels={showNodeLabels}
									showSymbolLabels={showSymbolLabels}
									showSignsInRulershipPanel={showSignsInRulershipPanel}
								/>
							</div>
						</>
					)}
				</div>
			</aside>
		</div>
	)
	
}

export default App
