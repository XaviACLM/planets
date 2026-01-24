import { useMemo, FC, ReactNode } from 'react';
import { Node, Zodiac } from './astroDefs';
import { zodiacSymbols, nodeSymbols } from './astroGraphics.ts';
import { type DispositorChain, RulershipGraph } from './rulershipGraph.ts';

type RulershipPanelProps = {
	rulershipGraph: RulershipGraph;
	showNodeLabels: boolean;
	showSymbolLabels: boolean;
	showSignsInRulershipPanel: boolean;
};

const RulershipPanel: FC<RulershipPanelProps> = ({
	rulershipGraph,
	showNodeLabels,
	showSymbolLabels,
	showSignsInRulershipPanel,
}) => {
	const symbolSize = 20;
	const textSize = 12;
	const textSizeTitle = 14;

	const renderSmallcapsString = (str: string): ReactNode => {
		return (
			<span className="small-caps font-bold" style={{ fontSize: textSize }}>
				{str}
			</span>
		);
	};

	const renderString = (str: string): ReactNode => {
		return (
			<span style={{ fontSize: textSize }}>
				{str}
			</span>
		);
	};

	const renderTitle = (str: string): ReactNode => {
		return (
			<span className="small-caps font-bold tracking-wide" style={{ fontSize: textSizeTitle }}>
				{str}
			</span>
		);
	};

	const renderNode = (node: Node): ReactNode => {
		return showNodeLabels ? (
			renderSmallcapsString(node)
		) : (
			<img
				src={nodeSymbols[node]}
				alt={node}
				width={symbolSize}
				height={symbolSize}
				className="invert align-middle inline"
			/>
		);
	};

	const renderSign = (sign: Zodiac): ReactNode => {
		return showSymbolLabels ? (
			renderSmallcapsString(sign)
		) : (
			<img
				src={zodiacSymbols[sign]}
				alt={sign}
				width={symbolSize}
				height={symbolSize}
				className="invert align-middle inline"
			/>
		);
	};

	const renderArrow = (): ReactNode => {
		return <span className="mx-1" style={{ fontSize: textSize }}>{" → "}</span>;
	};

	const renderMutualArrow = (): ReactNode => {
		return <span className="mx-1" style={{ fontSize: textSize }}>{" ⇄ "}</span>;
	};

	const renderNodeWithSign = (node: Node, sign: Zodiac): ReactNode => {
		if (showSignsInRulershipPanel) {
			const parenSize = showSymbolLabels ? textSize * 1 : textSize * 1.5;
			const parenOpacity = showSymbolLabels ? 0.8 : 0.4;
			return (
				<span className="whitespace-nowrap">
					{renderNode(node)}
					<span style={{ fontSize: parenSize, opacity: parenOpacity }}> [</span>
					{renderSign(sign)}
					<span style={{ fontSize: parenSize, opacity: parenOpacity }}>]</span>
				</span>
			);
		} else {
			return renderNode(node);
		}
	};

	const renderFinalDispositor = (fd: Node[], index: number): ReactNode => {
		if (fd.length === 1) {
			return (
				<div key={index} className="mb-1">
					{renderNodeWithSign(fd[0], rulershipGraph.getSign(fd[0]))}
					{renderString(" in domicile.")}
				</div>
			);
		} else if (fd.length === 2) {
			return (
				<div key={index} className="mb-1">
					{renderNodeWithSign(fd[0], rulershipGraph.getSign(fd[0]))}
					{renderMutualArrow()}
					{renderNodeWithSign(fd[1], rulershipGraph.getSign(fd[1]))}
					{renderString(" in reception.")}
				</div>
			);
		} else {
			return (
				<div key={index} className="mb-1">
					{fd.map((node, i) => (
						<span key={i}>
							{renderNodeWithSign(node, rulershipGraph.getSign(node))}
							{renderArrow()}
						</span>
					))}
					{renderNode(fd.nodes[0])}
				</div>
			);
		}
	};

	const renderChain = (chain: DispositorChain, index: number): ReactNode => {
		return (
			<div key={index} className="mb-1 pl-4" style={{ textIndent: "-1em" }}>
				{chain.chain.slice(0, chain.cycleStartIndex + 1).map((node, i) => (
					i === 0 ? (
						<span key={i}>
							{renderNodeWithSign(node, rulershipGraph.getSign(node))}
						</span>
					) : (
						<span key={i}>
							<></> {/* need an element we can linebreak on (for some reason zwsp doesn't work) */}
							<span className="whitespace-nowrap">
								{renderArrow()}
								{renderNodeWithSign(node, rulershipGraph.getSign(node))}
							</span>
						</span>
					)
				))}
			</div>
		);
	};

	return (
		<div className="text-white p-4" style={{ width: 330 }}>
			<div>
				{renderTitle("Final Dispositors")}
				<div className="mt-2">
					{rulershipGraph.getFinalDispositors().map((fd, i) => renderFinalDispositor(fd, i))}
				</div>
			</div>

			<hr className="opacity-50 my-2" />
			
			<div>
				{renderTitle("Dispositorship Chains")}
				<div className="mt-2">
					{rulershipGraph.getLeafNodes()
						.map(node => rulershipGraph.getDispositorChain(node))
						.map((chain, i) => renderChain(chain, i))}
				</div>
			</div>
		</div>
	);
};

export default RulershipPanel;
