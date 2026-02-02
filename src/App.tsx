import { useState, useEffect, useMemo } from 'react'

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import DominanceChart, { AbridgedDominanceChart } from './DominanceChart'
import HemispheresChart from './HemispheresChart'
import RulershipPanel from './RulershipPanel'
import EsotericModePanel from './EsotericModePanel'
import { MainSettingsMenu, DominanceSettingsMenu, PlanetSettingsMenu, RulershipSettingsMenu, HemisphereSettingsMenu } from './settingsMenus'
import PlanetPanel from './PlanetPanel.tsx'
import ZodiacPositions from './zodiacPositions.ts'
import { RulershipGraph } from './rulershipGraph.ts'
import Module from './Module'
import { NodeSelector, AspectKindSelector } from './CategorySelector.tsx'
import { toZonedTime, fromZonedTime } from './util.ts'
import { HouseSystem } from './houses.ts'
import { findAspects, type Aspect, filterAspects, formatAspects, flattenSubaspectsToList, deleteAspectFromMap } from './aspects.ts'
import { type CityData } from './CitySearchEngine'
import { CitySelector } from './CitySelector'
import { Sidebar } from './Sidebar'
import { useSettingsStore } from './settingsStore.ts'
import { Theme } from './settingsDefs.ts'
import {
	PlanetInfoHelp,
	DominanceChartHelp,
	OrientationHelp,
	RulershipGraphHelp,
	NodeSelectorHelp,
	AspectSelectorHelp,
	GeneralSettingsHelp,
	AspectMenuHelp,
} from './helpContent'

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
						className="text-black text-sm icon-filter small-caps"
						value={toZonedTime(selectedDate, currentTimezone).toISOString().slice(0, 16)}
						onChange={(e) => setSelectedDate(fromZonedTime(new Date(e.target.value), currentTimezone))}
					/>
				</div>
				<Module
					title="Aspects"
					initialDisplayIndex={1}
					invert={true}
					helpContent={<AspectMenuHelp />}
				>
					<AspectMenu
						aspects={aspects}
						onHover={(aspect) => {setHighlightedAspect(aspect)}}
						onDelete={handleAspectDeletion}
					/>
				</Module>
			</Sidebar>

			<main className="flex-1 relative flex items-center justify-center overflow-hidden">
				<EsotericModePanel/>
				<button
					className="absolute top-4 right-4 text-theme-text bg-theme-bg border border-theme-border hover:border-theme-border-light p-2 pl-4 pr-4"
					onClick={() => setMenuOpen(!menuOpen)}
				>
					{menuOpen ? '✕' : '☰'}
				</button>
				<ZodiacWheel
					zodiacPositions={zodiacPositions}
					aspects={flattenedAspects}
					highlightedAspect={highlightedAspect}
				/>

				{zodiacPositions.houseSystemUndefinedForPosition() &&
					<div className="absolute bottom-5 right-5 bg-theme-bg text-theme-text px-4 py-3 font-mono text-sm border border-theme-border z-[1000] max-w-[400px] leading-relaxed">
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
							helpContent={<AspectSelectorHelp />}
						>
							<AspectKindSelector
								selectedItems={selectedAspectKinds}
								setSelectedItems={setSelectedAspectKinds}
							/>
						</Module>
						<Module
							title="General Settings"
							helpContent={<GeneralSettingsHelp />}
						>
							<MainSettingsMenu />
						</Module>
					</>
				) : (
					<>
						<Module
							title="Planet Info"
							settingsMenu={PlanetSettingsMenu}
							helpContent={<PlanetInfoHelp />}
						>
							<PlanetPanel
								zodiacPositions={zodiacPositions}
								rulershipGraph={rulershipGraph}
								aspects={aspects}
								date={selectedDate}
							/>
						</Module>
						<Module
							title="Element/Mode Balance"
							initialDisplayIndex={1}
							settingsMenu={DominanceSettingsMenu}
							helpContent={<DominanceChartHelp />}
						>
							<AbridgedDominanceChart zodiacPositions={zodiacPositions} />
							<DominanceChart zodiacPositions={zodiacPositions} />
						</Module>
						{ zodiacPositions.hasSurfacePosition()
						&& (
							<Module
								title="Orientation"
								settingsMenu={HemisphereSettingsMenu}
								helpContent={<OrientationHelp />}
							>
								<HemispheresChart
									zodiacPositions={zodiacPositions}
								/>
							</Module>
						)}
						<Module
							title="Rulership Graph"
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
