import { useMemo, FC, ReactNode } from 'react';
import { Node, Zodiac } from './astroDefs';
import { zodiacSymbols, nodeSymbols } from './astroGraphics.ts';
import { type DispositorChain, RulershipGraph } from './rulershipGraph.ts';
import { renderTitle, renderFinalDispositors, renderDispositorChain } from './renderPrimitives';
import { useSettingsStore } from './settingsStore.ts'

type RulershipPanelProps = {
	rulershipGraph: RulershipGraph;
};

const RulershipPanel: FC<RulershipPanelProps> = ({
	rulershipGraph,
}) => {
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const showSymbolLabels = useSettingsStore(s => s.showSymbolLabels);
	const showSignsInDispositorChains = useSettingsStore(s => s.showSignsInDispositorChains);
	return (
		<div className="text-white p-4" style={{ width: 330 }}>
			<div>
				{renderTitle("Final Dispositors")}
				<div className="mt-2">
					{rulershipGraph.getFinalDispositors().map((fd, i) => renderFinalDispositors(
						fd,
						true,
						showSignsInDispositorChains,
						showNodeLabels,
						showSymbolLabels,
						i))}
				</div>
			</div>

			<hr className="opacity-50 my-2" />
			
			<div>
				{renderTitle("Dispositorship Chains")}
				<div className="mt-2">
					{rulershipGraph.getLeafNodes()
						.map(node => rulershipGraph.getDispositorChain(node))
						.map((chain, i) => renderDispositorChain(
							chain,
							false, // do not include final dispositors (only the first)
							showSignsInDispositorChains,
							showNodeLabels,
							showSymbolLabels,
							i))}	
				</div>
			</div>
		</div>
	);
};

export default RulershipPanel;
