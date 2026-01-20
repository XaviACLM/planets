import { create } from 'zustand';
import { HouseSystem } from './houses.ts';
import {
	LunarNodeMode,
	AstrologyMode,
	Node,
	HamburgSchoolMode,
	initiallySelectedNodes,
	AspectKind,
	defaultAspectKinds,
	AspectPhysicalityFilter,
	AspectMenuMode,
	AspectErrorMode,
	RulershipMode
} from './astroDefs.ts';

interface SettingsState {
	// House settings
	selectedHouseSystem: HouseSystem;
	setSelectedHouseSystem: (v: HouseSystem) => void;
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
	showSignsInRulershipPanel: boolean;
	setShowSignsInRulershipPanel: (v: boolean) => void;

	// Display options
	flipText: boolean;
	setFlipText: (v: boolean) => void;
	rotateSymbols: boolean;
	setRotateSymbols: (v: boolean) => void;
	aspectsColorcoded: boolean;
	setAspectsColorcoded: (v: boolean) => void;

	// Aspect error settings
	selectedAspectErrorMode: AspectErrorMode;
	setSelectedAspectErrorMode: (v: AspectErrorMode) => void;
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
	selectedAspectMenuMode: AspectMenuMode;
	setSelectedAspectMenuMode: (v: AspectMenuMode) => void;

	// Astrology modes
	lunarNodeMode: LunarNodeMode;
	setLunarNodeMode: (v: LunarNodeMode) => void;
	hamburgSchoolMode: HamburgSchoolMode;
	setHamburgSchoolMode: (v: HamburgSchoolMode) => void;
	selectedAstrologyMode: AstrologyMode;
	setSelectedAstrologyMode: (v: AstrologyMode) => void;
	selectedRulershipMode: RulershipMode;
	setSelectedRulershipMode: (v: RulershipMode) => void;

	// Selections
	selectedNodes: Set<Node>;
	setSelectedNodes: (v: Set<Node>) => void;
	selectedAspectKinds: Set<AspectKind>;
	setSelectedAspectKinds: (v: Set<AspectKind>) => void;

}

export const useSettingsStore = create<SettingsState>((set) => ({
	// House settings
	selectedHouseSystem: HouseSystem.PLACIDUS,
	setSelectedHouseSystem: (v) => set({ selectedHouseSystem: v }),
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
	showSignsInRulershipPanel: false,
	setShowSignsInRulershipPanel: (v) => set({ showSignsInRulershipPanel: v }),

	// Display options
	flipText: true,
	setFlipText: (v) => set({ flipText: v }),
	rotateSymbols: false,
	setRotateSymbols: (v) => set({ rotateSymbols: v }),
	aspectsColorcoded: false,
	setAspectsColorcoded: (v) => set({ aspectsColorcoded: v }),

	// Aspect error settings
	selectedAspectErrorMode: AspectErrorMode.POINTWISE_MAX,
	setSelectedAspectErrorMode: (v) => set({ selectedAspectErrorMode: v }),
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
	selectedAspectMenuMode: AspectMenuMode.SHOW_MAXIMAL_WITH_SUBMENUS,
	setSelectedAspectMenuMode: (v) => set({ selectedAspectMenuMode: v }),

	// Astrology modes
	lunarNodeMode: LunarNodeMode.MEAN,
	setLunarNodeMode: (v) => set({ lunarNodeMode: v }),
	hamburgSchoolMode: HamburgSchoolMode.NEELY,
	setHamburgSchoolMode: (v) => set({ hamburgSchoolMode: v }),
	selectedAstrologyMode: AstrologyMode.TROPICAL,
	setSelectedAstrologyMode: (v) => set({ selectedAstrologyMode: v }),
	selectedRulershipMode: RulershipMode.MODERN,
	setSelectedRulershipMode: (v) => set({ selectedRulershipMode: v }),

	// Selections
	selectedNodes: new Set(initiallySelectedNodes),
	setSelectedNodes: (v) => set({ selectedNodes: v }),
	selectedAspectKinds: new Set(defaultAspectKinds),
	setSelectedAspectKinds: (v) => set({ selectedAspectKinds: v }),

}));
