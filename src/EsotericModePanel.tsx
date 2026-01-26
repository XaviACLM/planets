import { useState, FC } from 'react';

type EsotericModePanelProps = {
	setShowNodeLabels: (value: boolean) => void;
	setShowSymbolLabels: (value: boolean) => void;
	setShowElementLabels: (value: boolean) => void;
	setShowModeLabels: (value: boolean) => void;
	setShowSignsInDispositorChains: (value: boolean) => void;
};

const EsotericModePanel: FC<EsotericModePanelProps> = ({
	setShowNodeLabels,
	setShowSymbolLabels,
	setShowElementLabels,
	setShowModeLabels,
	setShowSignsInDispositorChains,
}) => {
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
		setPanelState('esoteric');
	};

	const exitEsotericMode = () => {
		setShowNodeLabels(true);
		setShowSymbolLabels(true);
		setShowElementLabels(true);
		setShowModeLabels(true);
		setShowSignsInDispositorChains(false);
		setPanelState('hidden');
	};

	const dismiss = () => {
		setPanelState('hidden');
	};

	return (
		<div className="absolute top-4 left-4 bg-black text-white px-4 py-3 font-mono text-sm border border-gray-500 z-[1000] flex items-center gap-3">
			{panelState === 'initial' ? (
				<>
					<button
						className="bg-transparent border-none text-white underline cursor-pointer p-0 m-0 font-[inherit]"
						onClick={enterEsotericMode}
					>
						Enter esoteric mode
					</button>
					<button
						className="bg-transparent border-none text-white cursor-pointer p-0 m-0 text-base leading-none opacity-70"
						onClick={dismiss}
						title="Dismiss"
					>
						✕
					</button>
				</>
			) : (
				<>
					<button
						className="bg-transparent border-none text-white underline cursor-pointer p-0 m-0 font-[inherit]"
						onClick={exitEsotericMode}
					>
						Go back to normal mode
					</button>
					<button
						className="bg-transparent border-none text-white cursor-pointer p-0 m-0 text-base leading-none opacity-70"
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
