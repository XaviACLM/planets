import { useMemo, FC, ReactNode } from 'react';
import { Node, Zodiac, standardNodes, RulershipMode, classicalRulerships, modernRulerships } from './astroDefs';
import { zodiacSymbols, nodeSymbols } from './astroGraphics.ts';
import { ZodiacPositions } from './astro.ts';

type RulershipPanelProps = {
	zodiacPositions: ZodiacPositions;
	rulershipMode: RulershipMode;
	showNodeLabels: boolean;
	showSymbolLabels: boolean;
	showSignsInRulershipPanel: boolean;
};

type FinalDispositor =
	| { type: 'domicile'; node: Node; sign: Zodiac }
	| { type: 'mutual_reception'; nodes: [Node, Node]; signs: [Zodiac, Zodiac] }
	| { type: 'cycle'; nodes: Node[]; signs: Zodiac[] };

type ChainStep = { node: Node; sign: Zodiac };

const RulershipPanel: FC<RulershipPanelProps> = ({
	zodiacPositions,
	rulershipMode,
	showNodeLabels,
	showSymbolLabels,
	showSignsInRulershipPanel,
}) => {
	const symbolSize = 20;
	const textSize = 12;
	const textSizeTitle = 14;

	const rulerships = rulershipMode === RulershipMode.CLASSICAL ? classicalRulerships : modernRulerships;

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

	// Build the rulership graph and compute final dispositors + chains
	const { finalDispositors, chains } = useMemo(() => {
		// Map each node to its sign and dispositor (ruler of that sign)
		const nodeToSign = new Map<Node, Zodiac>();
		const nodeToDispositor = new Map<Node, Node>();

		for (const node of standardNodes) {
			const sign = zodiacPositions.getSymbolOfNode(node);
			nodeToSign.set(node, sign);
			nodeToDispositor.set(node, rulerships[sign]);
		}

		// Find cycles by following dispositor chains
		const visited = new Set<Node>();
		const inCycle = new Set<Node>();
		const cycleMembers: Node[][] = [];

		for (const startNode of standardNodes) {
			if (visited.has(startNode)) continue;

			const path: Node[] = [];
			const pathSet = new Set<Node>();
			let current: Node = startNode;

			// Follow the chain until we hit a visited node or find a cycle
			while (!visited.has(current) && !pathSet.has(current)) {
				path.push(current);
				pathSet.add(current);
				current = nodeToDispositor.get(current)!;
			}

			// If we found a cycle (current is in pathSet), extract it
			if (pathSet.has(current)) {
				const cycleStartIndex = path.indexOf(current);
				const cycle = path.slice(cycleStartIndex);
				cycleMembers.push(cycle);
				for (const node of cycle) {
					inCycle.add(node);
				}
			}

			// Mark all nodes in path as visited
			for (const node of path) {
				visited.add(node);
			}
		}

		// Categorize final dispositors
		const finalDispositors: FinalDispositor[] = [];
		const processedCycles = new Set<string>();

		for (const cycle of cycleMembers) {
			const cycleKey = [...cycle].sort().join(',');
			if (processedCycles.has(cycleKey)) continue;
			processedCycles.add(cycleKey);

			if (cycle.length === 1) {
				const node = cycle[0];
				finalDispositors.push({
					type: 'domicile',
					node,
					sign: nodeToSign.get(node)!,
				});
			} else if (cycle.length === 2) {
				finalDispositors.push({
					type: 'mutual_reception',
					nodes: [cycle[0], cycle[1]],
					signs: [nodeToSign.get(cycle[0])!, nodeToSign.get(cycle[1])!],
				});
			} else {
				// Reorder cycle to start from the node and follow dispositor order
				const orderedCycle: Node[] = [];
				const orderedSigns: Zodiac[] = [];
				let current = cycle[0];
				for (let i = 0; i < cycle.length; i++) {
					orderedCycle.push(current);
					orderedSigns.push(nodeToSign.get(current)!);
					current = nodeToDispositor.get(current)!;
				}
				finalDispositors.push({
					type: 'cycle',
					nodes: orderedCycle,
					signs: orderedSigns,
				});
			}
		}

		// Find leaf nodes (nodes not pointed to by any other node)
		const pointedTo = new Set<Node>(nodeToDispositor.values());
		const leafNodes = standardNodes.filter(node => !pointedTo.has(node));

		// Build chains from each leaf node to a final dispositor
		const chains: ChainStep[][] = [];

		for (const leaf of leafNodes) {
			const chain: ChainStep[] = [];
			let current = leaf;

			while (!inCycle.has(current)) {
				chain.push({ node: current, sign: nodeToSign.get(current)! });
				current = nodeToDispositor.get(current)!;
			}

			// Add the first cycle member we hit (the final dispositor endpoint)
			chain.push({ node: current, sign: nodeToSign.get(current)! });

			if (chain.length > 1) {
				chains.push(chain);
			}
		}

		return { finalDispositors, chains };
	}, [zodiacPositions, rulerships]);

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
		}
		return renderNode(node);
	};

	const renderFinalDispositor = (fd: FinalDispositor, index: number): ReactNode => {
		if (fd.type === 'domicile') {
			return (
				<div key={index} className="mb-1">
					{renderNodeWithSign(fd.node, fd.sign)}
					{renderString(" in domicile.")}
				</div>
			);
		} else if (fd.type === 'mutual_reception') {
			return (
				<div key={index} className="mb-1">
					{renderNodeWithSign(fd.nodes[0], fd.signs[0])}
					{renderMutualArrow()}
					{renderNodeWithSign(fd.nodes[1], fd.signs[1])}
					{renderString(" in reception.")}
				</div>
			);
		} else {
			// Cycle of length 3+
			return (
				<div key={index} className="mb-1">
					{fd.nodes.map((node, i) => (
						<span key={i}>
							{renderNodeWithSign(node, fd.signs[i])}
							{renderArrow()}
						</span>
					))}
					{renderNode(fd.nodes[0])}
				</div>
			);
		}
	};

	const renderChain = (chain: ChainStep[], index: number): ReactNode => {
		return (
			<div key={index} className="mb-1 pl-4" style={{ textIndent: "-1em" }}>
				{chain.map((step, i) => (
					i === 0 ? (
						<span key={i}>
							{renderNodeWithSign(step.node, step.sign)}
						</span>
					) : (
						<span key={i}>
							<></>
							<span className="whitespace-nowrap">
								{renderArrow()}
								{renderNodeWithSign(step.node, step.sign)}
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
					{finalDispositors.length > 0 ? (
						finalDispositors.map((fd, i) => renderFinalDispositor(fd, i))
					) : (
						renderString("None")
					)}
				</div>
			</div>

			{chains.length > 0 && (
				<>
					<hr className="opacity-50 my-2" />
					<div>
						{renderTitle("Dispositorship Chains")}
						<div className="mt-2">
							{chains.map((chain, i) => renderChain(chain, i))}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default RulershipPanel;
