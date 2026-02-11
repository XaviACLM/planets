import { create } from 'zustand';
import { HouseSystem } from './houses.ts';
import { Node, initiallySelectedNodes, AstrologyMode } from './astroDefs.ts';
import { AspectKind, defaultAspectKinds } from './aspectDefs.ts';
import {
	LunarNodeMode,
	HamburgSchoolMode,
	AspectPhysicalityFilter,
	AspectMenuMode,
	AspectErrorMode,
	DignityMode,
	HouseAngularityMode,
	TriplicityMode,
	BoundsMode,
	FaceMode,
	Theme,
	NodesToConsider,
} from './settingsDefs.ts';

interface SettingsState {
	// House settings
	houseSystem: HouseSystem;
	setHouseSystem: (v: HouseSystem) => void;
	housePresweep: boolean;
	setHousePresweep: (v: boolean) => void;

	// Label visibility
	showAspectLabels: boolean;
	setShowAspectLabels: (v: boolean) => void;
	showNodeLabels: boolean;
	setShowNodeLabels: (v: boolean) => void;
	showSymbolLabels: boolean;
	setShowSymbolLabels: (v: boolean) => void;
	showElementLabels: boolean;
	setShowElementLabels: (v: boolean) => void;
	showModeLabels: boolean;
	setShowModeLabels: (v: boolean) => void;
	showSignsInDispositorChains: boolean;
	setShowSignsInDispositorChains: (v: boolean) => void;
	useArticleForMainAngles: boolean;
	setUseArticleForMainAngles: (v: boolean) => void;

	// Display options
	theme: Theme;
	setTheme: (v: Theme) => void;
	flipText: boolean;
	setFlipText: (v: boolean) => void;
	rotateSymbols: boolean;
	setRotateSymbols: (v: boolean) => void;
	aspectsColorcoded: boolean;
	setAspectsColorcoded: (v: boolean) => void;

	// Aspect error settings
	aspectErrorMode: AspectErrorMode;
	setAspectErrorMode: (v: AspectErrorMode) => void;
	maxConfigurationErrorDegrees: number;
	setMaxConfigurationErrorDegrees: (v: number) => void;
	maxMajorBAErrorDegrees: number;
	setMaxMajorBAErrorDegrees: (v: number) => void;
	maxMinorBAErrorDegrees: number;
	setMaxMinorBAErrorDegrees: (v: number) => void;

	// Aspect filtering
	aspectPhysicalityFilter: AspectPhysicalityFilter;
	setAspectPhysicalityFilter: (v: AspectPhysicalityFilter) => void;
	hamburgPhysical: boolean;
	setHamburgPhysical: (v: boolean) => void;
	aspectMenuMode: AspectMenuMode;
	setAspectMenuMode: (v: AspectMenuMode) => void;
	
	stationarySpeedPercentageThreshold: number;
	setStationarySpeedPercentageThreshold: (v: number) => void;
	
	nodesInDominanceChart: NodesToConsider;
	setNodesInDominanceChart: (v: NodesToConsider) => void;
	nodesInHemispheresChart: NodesToConsider;
	setNodesInHemispheresChart: (v: NodesToConsider) => void;

	// Astrology modes
	lunarNodeMode: LunarNodeMode;
	setLunarNodeMode: (v: LunarNodeMode) => void;
	hamburgSchoolMode: HamburgSchoolMode;
	setHamburgSchoolMode: (v: HamburgSchoolMode) => void;
	astrologyMode: AstrologyMode;
	setAstrologyMode: (v: AstrologyMode) => void;
	dignityMode: DignityMode;
	setDignityMode: (v: DignityMode) => void;
	houseAngularityMode: HouseAngularityMode;
	setHouseAngularityMode: (v: HouseAngularityMode) => void;
	useExtendedDignities: boolean;
	setUseExtendedDignities: (v: boolean) => void;
	triplicityMode: TriplicityMode;
	setTriplicityMode: (v: TriplicityMode) => void;
	boundsMode: BoundsMode;
	setBoundsMode: (v: BoundsMode) => void;
	faceMode: FaceMode;
	setFaceMode: (v: FaceMode) => void;

	// Selections
	selectedNodes: Set<Node>;
	setSelectedNodes: (v: Set<Node>) => void;
	selectedAspectKinds: Set<AspectKind>;
	setSelectedAspectKinds: (v: Set<AspectKind>) => void;

}

export const useSettingsStore = create<SettingsState>((set) => ({
	// House settings
	houseSystem: HouseSystem.PLACIDUS,
	setHouseSystem: (v) => set({ houseSystem: v }),
	housePresweep: false,
	setHousePresweep: (v) => set({ housePresweep: v }),

	// Label visibility
	showAspectLabels: false,
	setShowAspectLabels: (v) => set({ showAspectLabels: v }),
	showNodeLabels: true,
	setShowNodeLabels: (v) => set({ showNodeLabels: v }),
	showSymbolLabels: true,
	setShowSymbolLabels: (v) => set({ showSymbolLabels: v }),
	showElementLabels: true,
	setShowElementLabels: (v) => set({ showElementLabels: v }),
	showModeLabels: true,
	setShowModeLabels: (v) => set({ showModeLabels: v }),
	showSignsInDispositorChains: false,
	setShowSignsInDispositorChains: (v) => set({ showSignsInDispositorChains: v }),
	useArticleForMainAngles: false,
	setUseArticleForMainAngles: (v) => set({ useArticleForMainAngles: v }),

	// Display options
	theme: Theme.PARCHMENT,
	setTheme: (v) => set({ theme: v }),
	flipText: true,
	setFlipText: (v) => set({ flipText: v }),
	rotateSymbols: false,
	setRotateSymbols: (v) => set({ rotateSymbols: v }),
	aspectsColorcoded: true,
	setAspectsColorcoded: (v) => set({ aspectsColorcoded: v }),

	// Aspect error settings
	aspectErrorMode: AspectErrorMode.POINTWISE_MAX,
	setAspectErrorMode: (v) => set({ aspectErrorMode: v }),
	maxConfigurationErrorDegrees: 3,
	setMaxConfigurationErrorDegrees: (v) => set({ maxConfigurationErrorDegrees: v }),
	maxMajorBAErrorDegrees: 3,
	setMaxMajorBAErrorDegrees: (v) => set({ maxMajorBAErrorDegrees: v }),
	maxMinorBAErrorDegrees: 3,
	setMaxMinorBAErrorDegrees: (v) => set({ maxMinorBAErrorDegrees: v }),

	// Aspect filtering
	aspectPhysicalityFilter: AspectPhysicalityFilter.ALL_BUT_ONE_PHYSICAL,
	setAspectPhysicalityFilter: (v) => set({ aspectPhysicalityFilter: v }),
	hamburgPhysical: false,
	setHamburgPhysical: (v) => set({ hamburgPhysical: v }),
	aspectMenuMode: AspectMenuMode.SHOW_MAXIMAL_WITH_SUBMENUS,
	setAspectMenuMode: (v) => set({ aspectMenuMode: v }),
	
	stationarySpeedPercentageThreshold: 30,
	setStationarySpeedPercentageThreshold: (v) => set({ stationarySpeedPercentageThreshold: v }),
	
	nodesInDominanceChart: NodesToConsider.STANDARD,
	setNodesInDominanceChart: (v) => set({ nodesInDominanceChart: v }),
	nodesInHemispheresChart: NodesToConsider.STANDARD,
	setNodesInHemispheresChart: (v) => set({ nodesInHemispheresChart: v }),

	// Astrology modes
	lunarNodeMode: LunarNodeMode.MEAN,
	setLunarNodeMode: (v) => set({ lunarNodeMode: v }),
	hamburgSchoolMode: HamburgSchoolMode.NEELY,
	setHamburgSchoolMode: (v) => set({ hamburgSchoolMode: v }),
	astrologyMode: AstrologyMode.TROPICAL,
	setAstrologyMode: (v) => set({ astrologyMode: v }),
	dignityMode: DignityMode.MODERN,
	setDignityMode: (v) => set({ dignityMode: v }),
	houseAngularityMode: HouseAngularityMode.TRADITIONAL,
	setHouseAngularityMode: (v) => set({ houseAngularityMode: v }),
	useExtendedDignities: false,
	setUseExtendedDignities: (v) => set({ useExtendedDignities: v }),
	triplicityMode: TriplicityMode.PTOLEMAIC_LILLY,
	setTriplicityMode: (v) => set({ triplicityMode: v }),
	boundsMode: BoundsMode.PTOLEMAIC,
	setBoundsMode: (v) => set({ boundsMode: v }),
	faceMode: FaceMode.MODERN,
	setFaceMode: (v) => set({ faceMode: v }),

	// Selections
	selectedNodes: new Set(initiallySelectedNodes),
	setSelectedNodes: (v) => set({ selectedNodes: v }),
	selectedAspectKinds: new Set(defaultAspectKinds),
	setSelectedAspectKinds: (v) => set({ selectedAspectKinds: v }),

}));
