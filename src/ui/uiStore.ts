import { create } from 'zustand';

interface UIState {
	// Module collapse states: key is module title, value is display index
	// 0 = collapsed, 1+ = show nth child
	moduleDisplayStates: Record<string, number>;
	setModuleDisplayState: (id: string, index: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
	moduleDisplayStates: {},
	setModuleDisplayState: (id, index) => set((state) => ({
		moduleDisplayStates: {
			...state.moduleDisplayStates,
			[id]: index,
		},
	})),
}));
