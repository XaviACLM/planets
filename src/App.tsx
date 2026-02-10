import { useState, useEffect, useMemo, useRef } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import DominanceChart, { AbridgedDominanceChart } from './DominanceChart'
import HemispheresChart from './HemispheresChart'
import RulershipPanel from './RulershipPanel'
import EsotericModePanel from './EsotericModePanel'
import ChartSummary from './ChartSummary'
import PlanetPanel from './PlanetPanel.tsx'
import ZodiacPositions from './zodiacPositions.ts'
import { RulershipGraph } from './rulershipGraph.ts'
import Module from './Module'
import { NodeSelector, AspectKindSelector } from './CategorySelector.tsx'
import { Node } from './astroDefs.ts'
import { toZonedTime, fromZonedTime, toISOLocal } from './util.ts'
import { HouseSystem } from './houses.ts'
import { findAspects, type Aspect, filterAspects, formatAspects, flattenSubaspectsToList, deleteAspectFromMap } from './aspects.ts'
import { type CityData } from './CitySearchEngine'
import { CitySelector } from './CitySelector'
import { Sidebar } from './Sidebar'
import { useSettingsStore } from './settingsStore.ts'
import { Theme } from './settingsDefs.ts'
import {
	MainSettingsMenu,
	DominanceSettingsMenu,
	PlanetSettingsMenu,
	RulershipSettingsMenu,
	HemisphereSettingsMenu,
	NodeSelectorSettingsMenu,
	AspectSelectorSettingsMenu
} from './settingsMenus'
import {
	PlanetInfoHelp,
	DominanceChartHelp,
	OrientationHelp,
	RulershipGraphHelp,
	NodeSelectorHelp,
	GeneralSettingsHelp,
	AspectMenuHelp,
} from './helpContent'
import AboutThisWebsite from './AboutThisWebsite.tsx'

function App() {

	// Settings needed for computations in App
	const houseSystem = useSettingsStore(s => s.houseSystem);
	const setHouseSystem = useSettingsStore(s => s.setHouseSystem);
	const housePresweep = useSettingsStore(s => s.housePresweep);
	const aspectErrorMode = useSettingsStore(s => s.aspectErrorMode);
	const maxConfigurationErrorDegrees = useSettingsStore(s => s.maxConfigurationErrorDegrees);
	const maxMajorBAErrorDegrees = useSettingsStore(s => s.maxMajorBAErrorDegrees);
	const maxMinorBAErrorDegrees = useSettingsStore(s => s.maxMinorBAErrorDegrees);
	const maxConfigurationError = useMemo(() => maxConfigurationErrorDegrees*Math.PI/180, [maxConfigurationErrorDegrees]);
	const maxMajorBAError = useMemo(() => maxMajorBAErrorDegrees*Math.PI/180, [maxMajorBAErrorDegrees]);
	const maxMinorBAError = useMemo(() => maxMinorBAErrorDegrees*Math.PI/180, [maxMinorBAErrorDegrees]);

	const aspectPhysicalityFilter = useSettingsStore(s => s.aspectPhysicalityFilter);
	const hamburgPhysical = useSettingsStore(s => s.hamburgPhysical);
	const aspectMenuMode = useSettingsStore(s => s.aspectMenuMode);

	const lunarNodeMode = useSettingsStore(s => s.lunarNodeMode);
	const hamburgSchoolMode = useSettingsStore(s => s.hamburgSchoolMode);
	const astrologyMode = useSettingsStore(s => s.astrologyMode);
	const dignityMode = useSettingsStore(s => s.dignityMode);

	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	const setSelectedNodes = useSettingsStore(s => s.setSelectedNodes);
	const selectedAspectKinds = useSettingsStore(s => s.selectedAspectKinds);
	const setSelectedAspectKinds = useSettingsStore(s => s.setSelectedAspectKinds);

	const theme = useSettingsStore(s => s.theme);

	// Sync theme to document element
	useEffect(() => {
		document.documentElement.classList.remove('theme-parchment');
		if (theme === Theme.PARCHMENT) {
			document.documentElement.classList.add('theme-parchment');
		}
	}, [theme]);

	// Local state (not settings)
	const [selectedCity, setSelectedCity] = useState<CityData|null>(null);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	const [menuOpen, setMenuOpen] = useState<boolean>(false);

	// Node focus state
	const [highlightedNode, setHighlightedNode] = useState<Node | null>(null);
	const [selectedNode, setSelectedNode] = useState<Node>(Node.SUN);

	// Sync selectedNode when highlightedNode becomes non-null
	useEffect(() => {
		if (highlightedNode !== null) {
			setSelectedNode(highlightedNode);
		}
	}, [highlightedNode]);

	const [zodiacPositions, setZodiacPositions] = useState(ZodiacPositions.create(selectedDate, selectedCity, lunarNodeMode, houseSystem, astrologyMode, hamburgSchoolMode, housePresweep));

	const rulershipGraph = useMemo<RulershipGraph>(() => {
		return RulershipGraph.create(zodiacPositions, dignityMode);
	}, [zodiacPositions, dignityMode])

	// all aspects of all kinds from all nodes
	const fullAspects = useMemo(() => {
		return findAspects(zodiacPositions.getNodePositions(), aspectErrorMode, maxConfigurationError, maxMajorBAError, maxMinorBAError);
	}, [zodiacPositions, aspectErrorMode, maxConfigurationError, maxMajorBAError, maxMinorBAError]);

	// aspects restricted to only selected kinds/nodes w/ sufficient physical nodes
	const filteredAspects = useMemo(() => {
		return filterAspects(
			fullAspects,
			zodiacPositions.getNodePositions(),
			selectedNodes,
			selectedAspectKinds,
			aspectPhysicalityFilter,
			hamburgPhysical,
			aspectErrorMode,
			maxConfigurationError,
			maxMajorBAError,
			maxMinorBAError
		);
		// note that errors or error mode are not in dependencies list
		// any change fullAspects recomputation which will force filteredAspects recomputation anyway
	}, [fullAspects, selectedNodes, selectedAspectKinds, aspectPhysicalityFilter, hamburgPhysical]);

	// aspects, filtered, in the format imposed by the aspect menu mode
	const [aspects, setAspects] = useState<Map<Aspect, Aspect[]>>(formatAspects(filteredAspects, aspectMenuMode));
	useEffect(() => {
		setAspects(formatAspects(filteredAspects, aspectMenuMode));
	}, [filteredAspects, aspectMenuMode])

	// aspects, flattened down to a single list for processing in UI components
	// (this might be possible to do w/ enforced redundancy but unnecessary and much too complicated, even considering the above)
	const flattenedAspects = useMemo(() => {
		return flattenSubaspectsToList(aspects)
	}, [aspects])

	// recompute zodiac whenever date or time changes
	useEffect(() => {
		setZodiacPositions(ZodiacPositions.create(selectedDate, selectedCity, lunarNodeMode, houseSystem, astrologyMode, hamburgSchoolMode, housePresweep));
	}, [selectedCity, selectedDate])

	// handlers for changing config details in the zodiac positions that only require partial recomputation
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeHouseSystem(houseSystem));
	}, [houseSystem])
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeLunarNodeMode(lunarNodeMode));
	}, [lunarNodeMode])
	useEffect(() => {
		setZodiacPositions(zodiacPositions.changeAstrologyMode(astrologyMode));
	}, [astrologyMode])
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

	// Debounced date input - local state updates immediately, actual state updates after delay
	const [dateInputValue, setDateInputValue] = useState<string>(
		toISOLocal(toZonedTime(selectedDate, currentTimezone)).slice(0, 16)
	);
	const dateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Sync local input state when selectedDate or timezone changes externally
	useEffect(() => {
		setDateInputValue(toISOLocal(toZonedTime(selectedDate, currentTimezone)).slice(0, 16));
	}, [selectedDate, currentTimezone]);

	function handleAspectDeletion(aspect: Aspect, parentAspect: Aspect | null){
		setAspects(deleteAspectFromMap(aspects, aspect, parentAspect));
	}

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-theme-bg">
			<Sidebar side="left">
				<div className="w-full bg-theme-bg border border-theme-border text-theme-text px-1">
					<CitySelector
						startingQueryText={selectedCity}
						onSelect={(city) => {
							setSelectedCity(city);
						}}
					/>
					<input
						aria-label="Date and time"
						type="datetime-local"
						className="text-sm"
						value={dateInputValue}
						onChange={(e) => {
							const newValue = e.target.value;
							setDateInputValue(newValue);

							// Clear any pending debounce
							if (dateDebounceRef.current) {
								clearTimeout(dateDebounceRef.current);
							}

							// Update actual state after 300ms of no typing
							dateDebounceRef.current = setTimeout(() => {
								const parsed = new Date(newValue);
								if (!isNaN(parsed.getTime())) {
									setSelectedDate(fromZonedTime(parsed, currentTimezone));
								}
							}, 300);
						}}
					/>
				</div>
				<Module
					title="Aspects"
					initialDisplayIndex={1}
					titlePosition={'right'}
					helpContent={<AspectMenuHelp />}
				>
					<AspectMenu
						aspects={aspects}
						onHover={(aspect) => {setHighlightedAspect(aspect)}}
						onDelete={handleAspectDeletion}
						highlightedNode={highlightedNode}
						clearHighlight={() => setHighlightedNode(null)}
					/>
				</Module>
			</Sidebar>

			<main
				className="flex-1 relative flex items-center justify-center overflow-hidden"
				onClick={() => setHighlightedNode(null)}
			>
				<EsotericModePanel/>
				<ChartSummary
					zodiacPositions={zodiacPositions}
					setHighlightedNode={setHighlightedNode}
				/>
				<button
					className="absolute top-4 right-4 text-theme-text bg-theme-bg border border-theme-border hover:border-theme-border-light p-2 pl-4 pr-4"
					onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
				>
					{menuOpen ? '✕' : '☰'}
				</button>
				<ZodiacWheel
					zodiacPositions={zodiacPositions}
					aspects={flattenedAspects}
					highlightedAspect={highlightedAspect}
					highlightedNode={highlightedNode}
					setHighlightedNode={setHighlightedNode}
				/>

				{zodiacPositions.houseSystemUndefinedForPosition() &&
					<div
						className="absolute bottom-5 right-5 bg-theme-bg text-theme-text px-4 py-3 font-mono text-sm border border-theme-border z-[1000] max-w-[400px] leading-relaxed"
						onClick={(e) => e.stopPropagation()}
					>
						<span>
							Selected house system ({houseSystem}) is not defined for the selected time and location.{" "}
							<button
								onClick={() => setHouseSystem(HouseSystem.PORPHYRY)}
								className="bg-transparent border-none text-theme-text underline cursor-pointer p-0 m-0 font-[inherit] inline hover:opacity-70 active:opacity-50"
							>
								Switch to Porphyry
							</button>
						</span>
					</div>
				}

			</main>
			<Sidebar side="right" animationKey={menuOpen ? 'settings' : 'main'}>
				{menuOpen ? (
					<>
						<Module
							title="Node Selector"
							initialDisplayIndex={0}
							titlePosition={'left'}
							settingsMenu={NodeSelectorSettingsMenu}
							helpContent={<NodeSelectorHelp />}
						>
							<NodeSelector
								selectedItems={selectedNodes}
								setSelectedItems={setSelectedNodes}
							/>
						</Module>
						<Module
							title="Aspect Selector"
							initialDisplayIndex={0}
							titlePosition={'left'}
							settingsMenu={AspectSelectorSettingsMenu}
						>
							<AspectKindSelector
								selectedItems={selectedAspectKinds}
								setSelectedItems={setSelectedAspectKinds}
							/>
						</Module>
						<Module
							title="General Settings"
							titlePosition={'left'}
							helpContent={<GeneralSettingsHelp />}
						>
							<MainSettingsMenu />
						</Module>
						<Module
							title="About This Website"
							titlePosition={'top'}
						>
							<AboutThisWebsite />
						</Module>
					</>
				) : (
					<>
						<Module
							title="Planet Info"
							titlePosition={'left'}
							settingsMenu={PlanetSettingsMenu}
							helpContent={<PlanetInfoHelp />}
						>
							<PlanetPanel
								zodiacPositions={zodiacPositions}
								rulershipGraph={rulershipGraph}
								aspects={aspects}
								date={selectedDate}
								selectedNode={selectedNode}
								isHighlighted={highlightedNode !== null}
								cycleToNode={(node) => {
									setSelectedNode(node);
									if (highlightedNode !== null) {
										setHighlightedNode(node);
									}
								}}
								highlightSelected={() => setHighlightedNode(selectedNode)}
							/>
						</Module>
						<Module
							title="Element/Mode Balance"
							initialDisplayIndex={1}
							titlePosition={'left'}
							helpContent={<DominanceChartHelp />}
						>
							<AbridgedDominanceChart zodiacPositions={zodiacPositions} />
							<DominanceChart zodiacPositions={zodiacPositions} />
						</Module>
						{ zodiacPositions.hasSurfacePosition()
						&& (
							<Module
								title="Orientation"
								titlePosition={'left'}
								helpContent={<OrientationHelp />}
							>
								<HemispheresChart
									zodiacPositions={zodiacPositions}
								/>
							</Module>
						)}
						<Module
							title="Rulership Graph"
							titlePosition={'left'}
							settingsMenu={RulershipSettingsMenu}
							helpContent={<RulershipGraphHelp />}
						>
							<RulershipPanel
								rulershipGraph={rulershipGraph}
							/>
						</Module>
					</>
				)}
			</Sidebar>
		</div>
	)

}

export default App
