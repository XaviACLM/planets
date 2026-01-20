import { useState, FC } from 'react';

type EsotericModePanelProps = {
	setShowNodeLabels: (value: boolean) => void;
	setShowSymbolLabels: (value: boolean) => void;
	setShowElementLabels: (value: boolean) => void;
	setShowModeLabels: (value: boolean) => void;
	setShowSignsInRulershipPanel: (value: boolean) => void;
};

const EsotericModePanel: FC<EsotericModePanelProps> = ({
	setShowNodeLabels,
	setShowSymbolLabels,
	setShowElementLabels,
	setShowModeLabels,
	setShowSignsInRulershipPanel,
}) => {
	const [panelState, setPanelState] = useState<'initial' | 'esoteric' | 'hidden'>('initial');

	if (panelState === 'hidden') {
		return null;
	}

	const panelStyle: React.CSSProperties = {
		position: 'absolute',
		top: '1rem',
		left: '1rem',
		backgroundColor: 'black',
		color: 'white',
		padding: '12px 16px',
		fontFamily: 'monospace',
		fontSize: 14,
		border: '1px solid #777',
		zIndex: 1000,
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
	};

	const buttonStyle: React.CSSProperties = {
		background: 'none',
		border: 'none',
		color: 'white',
		textDecoration: 'underline',
		cursor: 'pointer',
		padding: 0,
		margin: 0,
		font: 'inherit',
	};

	const closeButtonStyle: React.CSSProperties = {
		background: 'none',
		border: 'none',
		color: 'white',
		cursor: 'pointer',
		padding: 0,
		margin: 0,
		fontSize: 16,
		lineHeight: 1,
		opacity: 0.7,
	};

	const enterEsotericMode = () => {
		setShowNodeLabels(false);
		setShowSymbolLabels(false);
		setShowElementLabels(false);
		setShowModeLabels(false);
		setShowSignsInRulershipPanel(true);
		setPanelState('esoteric');
	};

	const exitEsotericMode = () => {
		setShowNodeLabels(true);
		setShowSymbolLabels(true);
		setShowElementLabels(true);
		setShowModeLabels(true);
		setShowSignsInRulershipPanel(false);
		setPanelState('hidden');
	};

	const dismiss = () => {
		setPanelState('hidden');
	};

	return (
		<div style={panelStyle}>
			{panelState === 'initial' ? (
				<>
					<button style={buttonStyle} onClick={enterEsotericMode}>
						Enter esoteric mode
					</button>
					<button style={closeButtonStyle} onClick={dismiss} title="Dismiss">
						✕
					</button>
				</>
			) : (
				<>
					<button style={buttonStyle} onClick={exitEsotericMode}>
						Go back to normal mode
					</button>
					<button style={closeButtonStyle} onClick={dismiss} title="Dismiss">
						✕
					</button>
				</>
			)}
		</div>
	);
};

export default EsotericModePanel;
