import { create } from 'zustand';
import { Node } from './astroDefs.ts'

interface UIState {
	// Module collapse states: key is module title, value is display index
	// 0 = collapsed, 1+ = show nth child
	moduleDisplayStates: Record<string, number>;
	setModuleDisplayState: (id: string, index: number) => void;
	selectedNodeInPlanetPanel: Node;
	setSelectedNodeInPlanetPanel: (node: Node) => void;
	selectedNodeInAspectPanel: Node | null;
	setSelectedNodeInAspectPanel: (node: Node | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
	moduleDisplayStates: {},
	setModuleDisplayState: (id, index) => set((state) => ({ //TODO do I need a ...state here?
		moduleDisplayStates: {
			...state.moduleDisplayStates,
			[id]: index,
		},
	})),
	selectedNodeInPlanetPanel: Node.SUN,
	setSelectedNodeInPlanetPanel: (node: Node) => set((state) => ({
		selectedNodeInPlanetPanel: node,
	})),
	selectedNodeInAspectPanel: null,
	setSelectedNodeInAspectPanel: (node: Node | null) => set((state) => ({
		selectedNodeInAspectPanel: node,
	})),
}));
