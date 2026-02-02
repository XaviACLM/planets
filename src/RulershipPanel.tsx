import { FC } from 'react';
import { RulershipGraph } from './rulershipGraph.ts';
import { renderTitle, renderFinalDispositors, renderDispositorChain } from './renderPrimitives';

type RulershipPanelProps = {
	rulershipGraph: RulershipGraph;
};

const RulershipPanel: FC<RulershipPanelProps> = ({
	rulershipGraph,
}) => {
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
