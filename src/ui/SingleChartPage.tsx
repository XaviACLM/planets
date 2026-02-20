import { useState, useEffect, useMemo, useRef } from 'react'

import { useEventChartPositions, useAspects } from '../model/astroHooks.ts'
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
import { RulershipGraph } from '../model/rulershipGraph.ts'
import Module from './Module'
import { NodeSelector, AspectKindSelector } from './CategorySelector.tsx'
import { type Aspect, deleteAspectFromMap } from '../model/aspects.ts'
import { Node } from '../defs/astroDefs.ts'
import WelcomeModal from './WelcomeModal'
import { Sidebar } from './Sidebar'
import { renderDotPattern } from './renderPrimitives'
import { useSettingsStore } from '../settings/settingsStore.ts'
import { Theme, HouseSystem } from '../defs/settingsDefs.ts'
import {
	MainSettingsMenu,
	DominanceSettingsMenu,
	PlanetSettingsMenu,
	RulershipSettingsMenu,
	HemisphereSettingsMenu,
	NodeSelectorSettingsMenu,
	AspectSelectorSettingsMenu,
	AspectMenuSettingsMenu
} from '../settings/settingsMenus'
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
import type { ChartInputs } from '../hooks/chartInputTypes'

const SIDEBAR_MAX = 360;
const BREAKPOINT_LARGE = 1200;
const BREAKPOINT_MEDIUM = 650;

function useWindowWidth() {
	const [width, setWidth] = useState(window.innerWidth);
	useEffect(() => {
		const onResize = () => setWidth(window.innerWidth);
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);
	return width;
}

interface SingleChartPageProps {
	useChartInputs: () => ChartInputs;
}

export default function SingleChartPage({ useChartInputs }: SingleChartPageProps) {

	const { selectedDate, selectedCity, timezone, PickerBar, WelcomeContent } = useChartInputs();

	// Settings needed for computations
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

	// Selected nodes and aspect kinds - also settings
	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	const setSelectedNodes = useSettingsStore(s => s.setSelectedNodes);
	const selectedAspectKinds = useSettingsStore(s => s.selectedAspectKinds);
	const setSelectedAspectKinds = useSettingsStore(s => s.setSelectedAspectKinds);

	// Visual settings
	const allowFloatingPlanetTable = useSettingsStore(s => s.allowFloatingPlanetTable);

	const theme = useSettingsStore(s => s.theme);

	// Sync theme to document element
	useEffect(() => {
		document.documentElement.classList.remove('theme-parchment');
		if (theme === Theme.PARCHMENT) {
			document.documentElement.classList.add('theme-parchment');
		}
	}, [theme]);

	// Local state (not settings)
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [showModal, setShowModal] = useState<boolean>(true);
	const tableScrollRef = useRef<HTMLDivElement>(null);
	const tableScrollTarget = useRef<number>(0);
	const [showScrollHint, setShowScrollHint] = useState(true);
	const [highlightMainAxes, setHighlightMainAxes] = useState(false);

	// Node focus state
	const [highlightedNode, setHighlightedNode] = useState<Node | null>(null);
	const [selectedNode, setSelectedNode] = useState<Node>(Node.SUN);

	// Sync selectedNode when highlightedNode becomes non-null
	useEffect(() => {
		if (highlightedNode !== null) {
			setSelectedNode(highlightedNode);
		}
	}, [highlightedNode]);

	// Responsive layout
	const windowWidth = useWindowWidth();
	const layout = windowWidth >= BREAKPOINT_LARGE ? 'large' : windowWidth >= BREAKPOINT_MEDIUM ? 'medium' : 'small';
	const sidebarZoom = layout === 'large'
		? Math.min(windowWidth / (3.5 * SIDEBAR_MAX), 1)
		: layout === 'medium'
		? Math.min(windowWidth / (2.5 * SIDEBAR_MAX), 1)
		: 1;

	// the chart data objects with all the updating/syncing logic
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

	// filtered + formatted / flattened aspect objects synced to the chart
	const { aspects, setAspects, flattenedAspects } = useAspects(
		nodePositions,
		selectedNodes,
		selectedAspectKinds,
		aspectPhysicalityFilter,
		hamburgPhysical,
		aspectMenuMode,
		aspectErrorMode,
		maxConfigurationError,
		maxMajorBAError,
		maxMinorBAError,
	);

	function handleAspectDeletion(aspect: Aspect, parentAspect: Aspect | null){
		setAspects(deleteAspectFromMap(aspects, aspect, parentAspect));
	}

	// ── Extracted component instances ──────────────────────────────────

	// TODO: PickerBar should be wrapped in a Module component

	const pickerBarModule = (
		<Module
			title=""
			initialDisplayIndex={1}
			showArrows={false}
			allowOverflow={true}
			titlePosition={'hidden'}
		>
			<PickerBar />
		</Module>
	);

	const aspectMenuModule = (
		<Module
			title="Aspects"
			initialDisplayIndex={1}
			titlePosition={'right'}
			settingsMenu={AspectMenuSettingsMenu}
			helpContent={<AspectMenuHelp />}
		>
			<AspectMenu
				aspects={aspects}
				nodePositions={nodePositions}
				onHover={(aspect) => {setHighlightedAspect(aspect)}}
				onDelete={handleAspectDeletion}
				highlightedNode={highlightedNode}
				clearHighlight={() => setHighlightedNode(null)}
			/>
		</Module>
	);

	const planetInfoModule = (
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
	);

	const dominanceModule = (
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
	);

	const orientationModule = nodePositions.hasSurfacePosition() ? (
		<Module
			title="Orientation"
			titlePosition={'left'}
			settingsMenu={HemisphereSettingsMenu}
			helpContent={<OrientationHelp />}
		>
			<HemispheresChart
				nodePositions={nodePositions}
				setIsChartHovered={setHighlightMainAxes}
			/>
		</Module>
	) : null;

	const rulershipModule = (
		<Module
			title="Rulership Graph"
			titlePosition={'left'}
			settingsMenu={RulershipSettingsMenu}
			helpContent={<RulershipGraphHelp />}
		>
			<RulershipPanel rulershipGraph={rulershipGraph} />
		</Module>
	);

	const settingsContent = (
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
	);

	const planetTable = (
		<PlanetTable
			nodePositions={nodePositions}
			nodeVelocities={nodeVelocities}
			zodiacSignPositions={zodiacSignPositions}
			fixedStarPositions={fixedStarPositions}
			houseCuspPositions={houseCuspPositions}
			aspects={aspects}
			onNodeClick={(node) => {
				setSelectedNode(node);
				if (highlightedNode !== null) {
					setHighlightedNode(node);
				}
			}}
		/>
	);

	const chartArea = (
		<>
			<div className="absolute inset-0 flex items-center justify-center">
				<ZodiacWheel
					nodePositions={nodePositions}
					zodiacSignPositions={zodiacSignPositions}
					houseCuspPositions={houseCuspPositions}
					aspects={flattenedAspects}
					highlightMainAxes={highlightMainAxes}
					highlightedAspect={highlightedAspect}
					highlightedNode={highlightedNode}
					setHighlightedNode={setHighlightedNode}
				/>
			</div>
			{nodePositions.hasSurfacePosition() && (
				<ChartSummary
					nodePositions={nodePositions}
					zodiacSignPositions={zodiacSignPositions}
					setHighlightedNode={setHighlightedNode}
				/>
			)}
		</>
	);

	const floatingUI = (
		<div className="absolute inset-0 pointer-events-none z-[100]">
			<div className="pointer-events-auto"><EsotericModePanel/></div>
			<button
				className="absolute top-4 right-4 text-theme-text bg-theme-bg backdrop-blur-sm border border-theme-border hover:border-theme-border-light p-2 pl-4 pr-4 pointer-events-auto"
				onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
			>
				{menuOpen ? '✕' : '☰'}
			</button>
			<div className="absolute bottom-5 right-5 flex flex-col gap-2 items-end pointer-events-auto">
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
		</div>
	);

	const scrollHint = showScrollHint ? (
		<div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[100] text-theme-text/70 text-sm pointer-events-none">
			Scroll down for table
		</div>
	) : null;

	const normalSidebarContent = (
		<>
			{pickerBarModule}
			{planetInfoModule}
			{dominanceModule}
			{orientationModule}
			{rulershipModule}
			{aspectMenuModule}
		</>
	);

	const modal = showModal ? (
		<WelcomeModal
			hasLocation={selectedCity !== null}
			onProceed={() => setShowModal(false)}
		>
			<WelcomeContent />
		</WelcomeModal>
	) : null;

	// ── Layout branches ───────────────────────────────────────────────

	if (layout === 'large') {
		return (
			<div className="flex h-screen w-screen overflow-hidden bg-theme-bg">
				<Sidebar side="left" zoom={sidebarZoom}>
					{pickerBarModule}
					{aspectMenuModule}
				</Sidebar>
				<main
					className="flex-1 relative overflow-hidden"
					onClick={() => setHighlightedNode(null)}
					onWheel={(e) => {
						if (tableScrollRef.current) {
							tableScrollTarget.current += e.deltaY;
							tableScrollTarget.current = Math.max(0, Math.min(tableScrollTarget.current, tableScrollRef.current.scrollHeight - tableScrollRef.current.clientHeight));
							tableScrollRef.current.scrollTo({top: tableScrollTarget.current, behavior: 'smooth'});
							if (e.deltaY > 0 && showScrollHint) setShowScrollHint(false);
						}
					}}
				>
					{chartArea}
					<div ref={tableScrollRef} className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-none z-[50] pointer-events-none">
						<div style={{ height: '100%' }} />
						<div className="flex justify-center px-4 pointer-events-auto">
							{planetTable}
						</div>
						<div style={{ height: allowFloatingPlanetTable ? '100%' : '5%' }} />
					</div>
					{floatingUI}
					{scrollHint}
				</main>
				<Sidebar side="right" zoom={sidebarZoom} animationKey={menuOpen ? 'settings' : 'main'}>
					{menuOpen ? settingsContent : (
						<>
							{planetInfoModule}
							{dominanceModule}
							{orientationModule}
							{rulershipModule}
						</>
					)}
				</Sidebar>
				{modal}
			</div>
		);
	}

	if (layout === 'medium') {
		return (
			<div className="flex h-screen w-screen overflow-hidden bg-theme-bg">
				<main
					className="flex-1 relative overflow-hidden"
					onClick={() => setHighlightedNode(null)}
					onWheel={(e) => {
						if (tableScrollRef.current) {
							tableScrollTarget.current += e.deltaY;
							tableScrollTarget.current = Math.max(0, Math.min(tableScrollTarget.current, tableScrollRef.current.scrollHeight - tableScrollRef.current.clientHeight));
							tableScrollRef.current.scrollTo({top: tableScrollTarget.current, behavior: 'smooth'});
							if (e.deltaY > 0 && showScrollHint) setShowScrollHint(false);
						}
					}}
				>
					{chartArea}
					<div ref={tableScrollRef} className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-none z-[50] pointer-events-none">
						<div style={{ height: '100%' }} />
						<div className="flex justify-center px-4 pointer-events-auto">
							{planetTable}
						</div>
						<div style={{ height: allowFloatingPlanetTable ? '100%' : '5%' }} />
					</div>
					{floatingUI}
					{scrollHint}
				</main>
				<Sidebar side="right" zoom={sidebarZoom} animationKey={menuOpen ? 'settings' : 'main'}>
					{menuOpen ? settingsContent : normalSidebarContent}
				</Sidebar>
				{modal}
			</div>
		);
	}

	// Small layout — single column
	return (
		<div className="flex flex-col h-screen w-screen overflow-y-auto bg-theme-bg scrollbar-none">
			<div
				className="relative w-full shrink-0"
				style={{ height: '140vw' }}
				onClick={() => setHighlightedNode(null)}
			>
				{chartArea}
				{floatingUI}
			</div>
			<div className="flex flex-col gap-2 p-2 relative">
				{renderDotPattern()}
				<div className="relative z-10 max-w-[330px] mx-auto">
				{menuOpen ? settingsContent : (
					<>
						{normalSidebarContent}
						<div className="flex justify-center px-4">
							{planetTable}
						</div>
					</>
				)}
				</div>
			</div>
			{modal}
		</div>
	);
}
