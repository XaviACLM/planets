import { type FC } from 'react';
import { RulershipGraph } from '../model/rulershipGraph.ts';
import { renderTitle, renderFinalDispositors, renderDispositorChain } from './renderPrimitives';
import { useSettingsStore } from '../settings/settingsStore.ts'

type RulershipPanelProps = {
	rulershipGraph: RulershipGraph;
};

const RulershipPanel: FC<RulershipPanelProps> = ({
	rulershipGraph,
}) => {
	
	// locally unused, render dependency
	// ( = these lines here to force rerender if these values change)
	useSettingsStore(s => s.showNodeLabels);
	useSettingsStore(s => s.showSymbolLabels);
	useSettingsStore(s => s.showSignsInDispositorChains);
	
	return (
		<div className="text-theme-text p-4" style={{ width: 330 }}>
			<div>
				{renderTitle("Final Dispositors")}
				<div className="mt-2">
					{rulershipGraph.getFinalDispositors().map((fd, i) => renderFinalDispositors(
						fd,
						true,
						undefined,
						undefined,
						undefined,
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
							false,
							undefined,
							undefined,
							undefined,
							i))}
				</div>
			</div>
		</div>
	);
};

export default RulershipPanel;
