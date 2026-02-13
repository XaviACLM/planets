import { useState, useEffect, useMemo, useRef } from 'react'

import { useEventChartPositions } from './astroHooks.ts'
import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import { DominanceChart, AbridgedDominanceChart } from './DominanceChart'
import HemispheresChart from './HemispheresChart'
import RulershipPanel from './RulershipPanel'
import EsotericModePanel from './EsotericModePanel'
import ChartSummary from './ChartSummary'
import PlanetPanel from './PlanetPanel.tsx'
import PlanetTable from './PlanetTable.tsx'
import InfoPopup from './InfoPopup.tsx'
import { RulershipGraph } from './rulershipGraph.ts'
import Module from './Module'
import { NodeSelector, AspectKindSelector } from './CategorySelector.tsx'
import { Node } from './astroDefs.ts'
import { toZonedTime, fromZonedTime, toISOLocal } from './util.ts'
import { findAspects, type Aspect, filterAspects, formatAspects, flattenSubaspectsToList, deleteAspectFromMap } from './aspects.ts'
import { CitySelector } from './CitySelector'
import { Sidebar } from './Sidebar'
import { useSettingsStore } from './settingsStore.ts'
import { Theme, HouseSystem } from './settingsDefs.ts'
import {
	MainSettingsMenu,
	DominanceSettingsMenu,
	PlanetSettingsMenu,
	RulershipSettingsMenu,
	HemisphereSettingsMenu,
	NodeSelectorSettingsMenu,
	AspectSelectorSettingsMenu,
	AspectMenuSettingsMenu
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
	const setHousePresweep = useSettingsStore(s => s.setHousePresweep);
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
	const zodiacMode = useSettingsStore(s => s.zodiacMode);
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
	const [selectedDate, setSelectedDate] = useState(() => new Date());
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

	// the chart data objects with all the updating/syncinc logic
	const {
		fixedStarPositions,
		zodiacSignPositions,
		houseCuspPositions,
		nodePositions,
		nodeVelocities,
		houseSystemComputationFailed,
	} = useEventChartPositions(
		selectedCity,
		selectedDate,
		zodiacMode,
		houseSystem,
		housePresweep,
		lunarNodeMode,
		hamburgSchoolMode,
		dignityMode,
	);

	// rulershipGraph just recomputes every time, so useMemo is fine
	const rulershipGraph = useMemo<RulershipGraph>(() => {
		return RulershipGraph.create(nodePositions, zodiacSignPositions, dignityMode);
	}, [nodePositions, zodiacSignPositions, dignityMode])

	// all aspects of all kinds from all nodes
	const fullAspects = useMemo(() => {
		return findAspects(nodePositions.getPositions(), aspectErrorMode, maxConfigurationError, maxMajorBAError, maxMinorBAError);
	}, [nodePositions, aspectErrorMode, maxConfigurationError, maxMajorBAError, maxMinorBAError]);

	// aspects restricted to only selected kinds/nodes w/ sufficient physical nodes
	const filteredAspects = useMemo(() => {
		return filterAspects(
			fullAspects,
			nodePositions.getPositions(),
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
	const [aspects, setAspects] = useState<Map<Aspect, Aspect[]>>(() => formatAspects(filteredAspects, aspectMenuMode));
	useEffect(() => {
		setAspects(formatAspects(filteredAspects, aspectMenuMode));
	}, [filteredAspects, aspectMenuMode])

	// aspects, flattened down to a single list for processing in UI components
	// (this might be possible to do w/ enforced redundancy but unnecessary and much too complicated, even considering the above)
	const flattenedAspects = useMemo(() => {
		return flattenSubaspectsToList(aspects)
	}, [aspects])
	
	const currentTimezone = useMemo(() => {
		if (selectedCity === null) {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		}
		return selectedCity.timezone;
	}, [selectedCity]);

	// Debounced date input - local state updates immediately, actual state updates after delay
	const [dateInputValue, setDateInputValue] = useState<string>(() =>
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
					settingsMenu={AspectMenuSettingsMenu}
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
				{nodePositions.hasSurfacePosition() && (
					<ChartSummary
						nodePositions={nodePositions}
						zodiacSignPositions={zodiacSignPositions}
						setHighlightedNode={setHighlightedNode}
					/>
				)}
				<button
					className="absolute top-4 right-4 text-theme-text bg-theme-bg border border-theme-border hover:border-theme-border-light p-2 pl-4 pr-4"
					onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
				>
					{menuOpen ? '✕' : '☰'}
				</button>
				
				<ZodiacWheel
					nodePositions={nodePositions}
					zodiacSignPositions={zodiacSignPositions}
					houseCuspPositions={houseCuspPositions}
					aspects={flattenedAspects}
					highlightedAspect={highlightedAspect}
					highlightedNode={highlightedNode}
					setHighlightedNode={setHighlightedNode}
				/>
				<PlanetTable
					nodePositions={nodePositions}
					nodeVelocities={nodeVelocities}
					zodiacSignPositions={zodiacSignPositions}
					fixedStarPositions={fixedStarPositions}
					houseCuspPositions={houseCuspPositions}
					aspects={aspects}
					setHighlightedNode={setHighlightedNode}
				/>

				<div className="absolute bottom-5 right-5 z-[1000] flex flex-col gap-2 items-end">
					{/* Note that these stay closed forever once X is pressed, even if some condition would force them to reappear */}
					{/* This is expected */}
					{houseCuspPositions !== null && !houseCuspPositions.areHouseCuspsWithinHouse() &&
						<InfoPopup>
							Selected house system ({houseSystem}) has narrow ({"<5º"}) houses for the selected time and location.{" "}
							Since presweep is activated, this results in some house cusps being outside of their house.{" "}
							Consider switching house system or {" "}
							<button
								onClick={() => setHousePresweep(false)}
								className="bg-transparent border-none text-theme-text underline cursor-pointer p-0 m-0 font-[inherit] inline hover:opacity-70 active:opacity-50"
							>
								turning off presweep
							</button>
							.
						</InfoPopup>
					}
					{houseSystemComputationFailed &&
						<InfoPopup>
							Selected house system ({houseSystem}) is not defined for the selected time and location.{" "}
							Consider switching to another house system, e.g.{" "}
							<button
								onClick={() => setHouseSystem(HouseSystem.PORPHYRY)}
								className="bg-transparent border-none text-theme-text underline cursor-pointer p-0 m-0 font-[inherit] inline hover:opacity-70 active:opacity-50"
							>
								switch to Porphyry
							</button>
							.
						</InfoPopup>
					}
				</div>

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
								nodePositions={nodePositions}
								nodeVelocities={nodeVelocities}
								zodiacSignPositions={zodiacSignPositions}
								fixedStarPositions={fixedStarPositions}
								houseCuspPositions={houseCuspPositions}
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
							settingsMenu={DominanceSettingsMenu}
							helpContent={<DominanceChartHelp />}
						>
							<AbridgedDominanceChart nodePositions={nodePositions} zodiacSignPositions={zodiacSignPositions} />
							<DominanceChart nodePositions={nodePositions} zodiacSignPositions={zodiacSignPositions} />
						</Module>
						{ nodePositions.hasSurfacePosition()
						&& (
							<Module
								title="Orientation"
								titlePosition={'left'}
								settingsMenu={HemisphereSettingsMenu}
								helpContent={<OrientationHelp />}
							>
								<HemispheresChart
									nodePositions={nodePositions}
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
