import { useState, FC } from 'react';
import { useSettingsStore } from './settingsStore.ts'
	
type EsotericModePanelProps = {
};

const EsotericModePanel: FC<EsotericModePanelProps> = ({
}) => {
	const setShowNodeLabels = useSettingsStore(s => s.setShowNodeLabels);
	const setShowSymbolLabels = useSettingsStore(s => s.setShowSymbolLabels);
	const setShowElementLabels = useSettingsStore(s => s.setShowElementLabels);
	const setShowModeLabels = useSettingsStore(s => s.setShowModeLabels);
	const setShowSignsInDispositorChains = useSettingsStore(s => s.setShowSignsInDispositorChains);
	const setUseExtendedDignities = useSettingsStore(s => s.setUseExtendedDignities);
	
	const [panelState, setPanelState] = useState<'initial' | 'esoteric' | 'hidden'>('initial');

	if (panelState === 'hidden') {
		return null;
	}

	const enterEsotericMode = () => {
		setShowNodeLabels(false);
		setShowSymbolLabels(false);
		setShowElementLabels(false);
		setShowModeLabels(false);
		setShowSignsInDispositorChains(true);
		setUseExtendedDignities(true);
		setPanelState('esoteric');
	};

	const exitEsotericMode = () => {
		setShowNodeLabels(true);
		setShowSymbolLabels(true);
		setShowElementLabels(true);
		setShowModeLabels(true);
		setShowSignsInDispositorChains(false);
		setUseExtendedDignities(false);
		setPanelState('hidden');
	};

	const dismiss = () => {
		setPanelState('hidden');
	};

	return (
		<div
			className="absolute top-4 left-4 bg-theme-bg text-theme-text px-4 py-3 font-mono text-sm border border-theme-border z-[1000] flex items-center gap-3"
			onClick={(e) => e.stopPropagation()}
		>
			{panelState === 'initial' ? (
				<>
					<button
						className="bg-transparent border-none text-theme-text underline cursor-pointer p-0 m-0 font-[inherit]"
						onClick={enterEsotericMode}
					>
						Enter esoteric mode
					</button>
					<button
						className="bg-transparent border-none text-theme-text cursor-pointer p-0 m-0 text-base leading-none opacity-70"
						onClick={dismiss}
						title="Dismiss"
					>
						✕
					</button>
				</>
			) : (
				<>
					<button
						className="bg-transparent border-none text-theme-text underline cursor-pointer p-0 m-0 font-[inherit]"
						onClick={exitEsotericMode}
					>
						Go back to normal mode
					</button>
					<button
						className="bg-transparent border-none text-theme-text cursor-pointer p-0 m-0 text-base leading-none opacity-70"
						onClick={dismiss}
						title="Dismiss"
					>
						✕
					</button>
				</>
			)}
		</div>
	);
};

export default EsotericModePanel;
