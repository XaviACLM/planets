import { useState, useEffect, useMemo } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import DominanceChart from './DominanceChart'
import HemispheresChart from './HemispheresChart'
import RulershipPanel from './RulershipPanel'
import EsotericModePanel from './EsotericModePanel'
import SettingsMenu from './SettingsMenu'
import PlanetPanel from './PlanetPanel.tsx'
import ZodiacPositions from './zodiacPositions.ts'
import { RulershipGraph } from './rulershipGraph.ts'
import Module, { CollapseState } from './Module'
import { NodeSelector, AspectKindSelector } from './CategorySelector.tsx'
import { toZonedTime, fromZonedTime } from './util.ts'
import { HouseSystem } from './houses.ts'
import { findAspects, type Aspect, filterAspects, formatAspects, flattenSubaspectsToList, deleteAspectFromMap } from './aspects.ts'
import { type CityData } from './CitySearchEngine'
import { CitySelector } from './CitySelector'
import { useSettingsStore } from './settingsStore.ts'

function App() {

	const selectedHouseSystem = useSettingsStore(s => s.selectedHouseSystem);
	const setSelectedHouseSystem = useSettingsStore(s => s.setSelectedHouseSystem);
	const housePresweep = useSettingsStore(s => s.housePresweep);

	const showAspectLabels = useSettingsStore(s => s.showAspectLabels);
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const setShowNodeLabels = useSettingsStore(s => s.setShowNodeLabels);
	const showSymbolLabels = useSettingsStore(s => s.showSymbolLabels);
	const setShowSymbolLabels = useSettingsStore(s => s.setShowSymbolLabels);
	const showElementLabels = useSettingsStore(s => s.showElementLabels);
	const setShowElementLabels = useSettingsStore(s => s.setShowElementLabels);
	const showModeLabels = useSettingsStore(s => s.showModeLabels);
	const setShowModeLabels = useSettingsStore(s => s.setShowModeLabels);

	const flipText = useSettingsStore(s => s.flipText);
	const rotateSymbols = useSettingsStore(s => s.rotateSymbols);
	const aspectsColorcoded = useSettingsStore(s => s.aspectsColorcoded);
	const showSignsInDispositorChains = useSettingsStore(s => s.showSignsInDispositorChains);
	const setShowSignsInDispositorChains = useSettingsStore(s => s.setShowSignsInDispositorChains);

	const selectedAspectErrorMode = useSettingsStore(s => s.selectedAspectErrorMode);
	const maxConfigurationErrorDegrees = useSettingsStore(s => s.maxConfigurationErrorDegrees);
	const maxMajorBAErrorDegrees = useSettingsStore(s => s.maxMajorBAErrorDegrees);
	const maxMinorBAErrorDegrees = useSettingsStore(s => s.maxMinorBAErrorDegrees);
	const maxConfigurationError = useMemo(() => maxConfigurationErrorDegrees*Math.PI/180, [maxConfigurationErrorDegrees]);
	const maxMajorBAError = useMemo(() => maxMajorBAErrorDegrees*Math.PI/180, [maxMajorBAErrorDegrees]);
	const maxMinorBAError = useMemo(() => maxMinorBAErrorDegrees*Math.PI/180, [maxMinorBAErrorDegrees]);

	const aspectPhysicalityFilter = useSettingsStore(s => s.aspectPhysicalityFilter);
	const hamburgPhysical = useSettingsStore(s => s.hamburgPhysical);
	const selectedAspectMenuMode = useSettingsStore(s => s.selectedAspectMenuMode);

	const lunarNodeMode = useSettingsStore(s => s.lunarNodeMode);
	const hamburgSchoolMode = useSettingsStore(s => s.hamburgSchoolMode);
	const selectedAstrologyMode = useSettingsStore(s => s.selectedAstrologyMode);
	const selectedDignityMode = useSettingsStore(s => s.selectedDignityMode);
	const selectedHouseAngularityMode = useSettingsStore(s => s.selectedHouseAngularityMode);

	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	const setSelectedNodes = useSettingsStore(s => s.setSelectedNodes);
	const selectedAspectKinds = useSettingsStore(s => s.selectedAspectKinds);
	const setSelectedAspectKinds = useSettingsStore(s => s.setSelectedAspectKinds);

	// Local state (not settings)
	const [selectedCity, setSelectedCity] = useState<CityData|null>(null);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const [zodiacPositions, setZodiacPositions] = useState(ZodiacPositions.create(selectedDate, selectedCity, lunarNodeMode, selectedHouseSystem, selectedAstrologyMode, hamburgSchoolMode, housePresweep));
	
	const rulershipGraph = useMemo<RulershipGraph>(() => {
		return RulershipGraph.create(zodiacPositions, selectedDignityMode);
	}, [zodiacPositions, selectedDignityMode])

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
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeHousePresweep(housePresweep));
	}, [housePresweep])

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
		<div className="flex h-screen w-screen overflow-hidden bg-black">
			<aside className="w-[360px] shrink-0 flex flex-col gap-2 p-2 bg-black overflow-y-auto overflow-x-hidden scrollbar-none animate-slide-in-left">
				<div className="w-full bg-black border border-gray-500 text-white">
					<CitySelector
						startingQueryText={selectedCity}
						onSelect={(city) => {
							setSelectedCity(city);
						}}
					/>
					<input
						aria-label="Date and time"
						type="datetime-local"
						className="text-black text-sm invert small-caps"
						value={toZonedTime(selectedDate, currentTimezone).toISOString().slice(0, 16)}
						onChange={(e) => setSelectedDate(fromZonedTime(new Date(e.target.value), currentTimezone))}
					/>
				</div>
				<div className="w-full bg-black border border-gray-500 text-white">
					<AspectMenu
						aspects={aspects}
						showAspectLabels={showAspectLabels}
						aspectsColorcoded={aspectsColorcoded}
						onHover={(aspect) => {setHighlightedAspect(aspect)}}
						onDelete={handleAspectDeletion}
					/>
				</div>
			</aside>

			<main className="flex-1 relative flex items-center justify-center overflow-hidden">
				<EsotericModePanel
					setShowNodeLabels={setShowNodeLabels}
					setShowSymbolLabels={setShowSymbolLabels}
					setShowElementLabels={setShowElementLabels}
					setShowModeLabels={setShowModeLabels}
					setShowSignsInDispositorChains={setShowSignsInDispositorChains}
				/>
				<button
					className="absolute top-4 right-4 text-white bg-black border border-gray-500 hover:border-gray-400 p-2 pl-4 pr-4"
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
					<div className="absolute bottom-5 right-5 bg-black text-white px-4 py-3 font-mono text-sm border border-gray-500 z-[1000] max-w-[400px] leading-relaxed">
						<span>
							Selected house system ({selectedHouseSystem}) is not defined for the selected time and location.{" "}
							<button
								onClick={() => setSelectedHouseSystem(HouseSystem.PORPHYRY)}
								className="bg-transparent border-none text-white underline cursor-pointer p-0 m-0 font-[inherit] inline hover:text-gray-300 active:text-gray-500"
							>
								Switch to Porphyry
							</button>
						</span>
					</div>
				}

			</main>

			<aside className="w-[360px] shrink-0 flex flex-col gap-2 p-2 bg-black overflow-y-auto overflow-x-hidden scrollbar-none relative">
				<div className="flex flex-col gap-2 animate-slide-in-right" key={menuOpen ? 'settings' : 'main'}>
					{menuOpen ? (
						<>
							<div className="w-full bg-black border border-gray-500 text-white">
								<NodeSelector
									selectedItems={selectedNodes}
									setSelectedItems={setSelectedNodes}
									showLabels={showNodeLabels}
								/>
							</div>
							<div className="w-full bg-black border border-gray-500 text-white">
								<AspectKindSelector
									selectedItems={selectedAspectKinds}
									setSelectedItems={setSelectedAspectKinds}
									showLabels={showAspectLabels}
								/>
							</div>
							<div className="w-full bg-black border border-gray-500 text-white">
								<SettingsMenu />
							</div>
						</>
					) : (
						<>
							<Module
								title="Planet Info"
								startingState={CollapseState.EXPANDED}
								supportsHalfCollapse={false}
							>
								<PlanetPanel
									zodiacPositions={zodiacPositions}
									rulershipGraph={rulershipGraph}
									aspects={aspects}
									date={selectedDate}
									dignityMode={selectedDignityMode}
									housesAngularityMode={selectedHouseAngularityMode}
									hamburgSchoolMode={hamburgSchoolMode}
									showNodeLabels={showNodeLabels}
									showSymbolLabels={showSymbolLabels}
									showElementLabels={showElementLabels}
									showModeLabels={showModeLabels}
									showSignsInDispositorChains={showSignsInDispositorChains}
								/>
							</Module>
							<Module
								title="Element/Mode Balance"
								startingState={CollapseState.HALF}
								supportsHalfCollapse={true}
							>
								{(abbreviated) => (
									<DominanceChart
										zodiacPositions={zodiacPositions}
										showNodeLabels={showNodeLabels}
										showElementLabels={showElementLabels}
										showModeLabels={showModeLabels}
										abbreviated={abbreviated}
									/>
								)}
							</Module>
							{ zodiacPositions.hasSurfacePosition()
							&& (
								<Module
									title="Orientation"
									startingState={CollapseState.EXPANDED}
									supportsHalfCollapse={false}
								>
									<HemispheresChart
										zodiacPositions={zodiacPositions}
										showNodeLabels={showNodeLabels}
									/>
								</Module>
							)}
							<div className="w-full bg-black border border-gray-500 text-white">
								<RulershipPanel
									rulershipGraph={rulershipGraph}
									showNodeLabels={showNodeLabels}
									showSymbolLabels={showSymbolLabels}
									showSignsInDispositorChains={showSignsInDispositorChains}
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
