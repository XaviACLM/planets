import { Node, Zodiac, standardNodes, classicalRulerships, modernRulerships } from './astroDefs';
import { DignityMode } from './settingsDefs.ts'
import NodePositions from './nodePositions.ts'
import ZodiacSignPositions from './zodiacSignPositions.ts'
import { getSignOfNode } from './chartAnalysis.ts'

// this approach (to get copyWith) is actually unnecessary since changing either main arg results in full recomputation
// but might be useful to keep it like this for later
// and it wouldn't be impossible to avoid recomputation, actually, at the very least ruledBy is very redundant. but...

function constructRulershipGraphInternals(nodePositions: NodePositions, zodiacSignPositions: ZodiacSignPositions, dignityMode: DignityMode) {

	const rulerships = dignityMode === DignityMode.CLASSICAL ? classicalRulerships : modernRulerships;

	const rules: Map<Node, Node[]> = new Map(standardNodes.map(node => [node, []]));
	const ruledBy = new Map<Node, Node>();
	const sign = new Map<Node, Zodiac>();
	for ( const node of standardNodes ){
		const symbol = getSignOfNode(node, nodePositions, zodiacSignPositions);
		const ruler = rulerships[symbol]
		ruledBy.set(node, ruler);
		rules.get(ruler)!.push(node);
		sign.set(node, symbol);
	}
	
	const leafNodes: Node[] = standardNodes.filter(node => rules.get(node)!.length == 0);
	
	const isFinalDispositor: Map<Node, boolean> = new Map(standardNodes.map(node => [node, false]));
	const finalDispositors: Node[][] = [];
	
	const visited: Map<Node, boolean> = new Map(standardNodes.map(node => [node, false]));
	for ( const node of standardNodes ){
		const chain: Node[] = [];
		var currentNode = node;
		while (true) {
			if (visited.get(currentNode)){
				if (chain.includes(currentNode)){
					//dispositor cycle!!
					const idx = chain.findIndex(n => n == currentNode);
					const finalDispositorGroup = chain.slice(idx, chain.length);
					finalDispositors.push(finalDispositorGroup);
					finalDispositorGroup.forEach(dispositor => isFinalDispositor.set(dispositor, true));
				}
				// if it's a dispositor cycle, we already added it: moving on...
				// if it's not a dispositorship cycle, then this is already explored: moving on...
				break;
			}
			visited.set(currentNode, true);
			chain.push(currentNode);
			currentNode = ruledBy.get(currentNode)!;
		}
	}
	
	const signedFinalDispositors = finalDispositors.map(nodes => {
		return {
			nodes: nodes,
			signs: nodes.map(node => sign.get(node)!),
		}
	})
	
	return { rulerships, sign, ruledBy, rules, leafNodes, finalDispositors: signedFinalDispositors, isFinalDispositor };
}

export interface FinalDispositors {
	nodes: Node[];
	signs: Zodiac[];
}

export interface DispositorChain {
	nodes: Node[];
	signs: Zodiac[];
	cycleStartIndex: number;
}

export function getFinalDispositorsOfChain(dispositorChain: DispositorChain): FinalDispositors {
	const idx = dispositorChain.cycleStartIndex;
	const len = dispositorChain.nodes.length;
	return {
		nodes: dispositorChain.nodes.slice(idx, len),
		signs: dispositorChain.signs.slice(idx, len),
	}
}

interface RulershipGraphConstructorArgs {
	nodePositions: NodePositions,
	zodiacSignPositions: ZodiacSignPositions,
	dignityMode: DignityMode,
	// internal
	_rulerships?: Record<Zodiac, Node>;
	_sign?: Map<Node, Zodiac>;
	_ruledBy?: Map<Node, Node>;
	_rules?: Map<Node, Node[]>;
	_leafNodes?: Node[];
	_finalDispositors?: FinalDispositors[];
	_isFinalDispositor?: Map<Node, boolean>;
}

export class RulershipGraph {
	public readonly nodePositions: NodePositions;
	public readonly zodiacSignPositions: ZodiacSignPositions;
	public readonly dignityMode: DignityMode;

	private readonly _rulerships: Record<Zodiac, Node>;
	private readonly _sign: Map<Node, Zodiac>;
	private readonly _ruledBy: Map<Node, Node>;
	private readonly _rules: Map<Node, Node[]>;
	private readonly _leafNodes: Node[];
	private readonly _finalDispositors: FinalDispositors[];
	private readonly _isFinalDispositor: Map<Node, boolean>;
	
	constructor( config: RulershipGraphConstructorArgs ){
		this.nodePositions = config.nodePositions;
		this.zodiacSignPositions = config.zodiacSignPositions;
		this.dignityMode = config.dignityMode;

		if (config._ruledBy) {
			// everything is defined, then
			this._rulerships = config._rulerships!;
			this._sign = config._sign!;
			this._ruledBy = config._ruledBy!;
			this._rules = config._rules!;
			this._leafNodes = config._leafNodes!;
			this._finalDispositors = config._finalDispositors!;
			this._isFinalDispositor = config._isFinalDispositor!;
			return;
		} else {
			const { rulerships, sign, ruledBy, rules, leafNodes, finalDispositors, isFinalDispositor } = constructRulershipGraphInternals(this.nodePositions, this.zodiacSignPositions, this.dignityMode);
			this._rulerships = rulerships;
			this._sign = sign;
			this._ruledBy = ruledBy;
			this._rules = rules;
			this._leafNodes = leafNodes;
			this._finalDispositors = finalDispositors;
			this._isFinalDispositor = isFinalDispositor;	
		}
	}
	
	static create(
		nodePositions: NodePositions,
		zodiacSignPositions: ZodiacSignPositions,
		dignityMode: DignityMode,
	): RulershipGraph {
		return new RulershipGraph({
			nodePositions: nodePositions,
			zodiacSignPositions: zodiacSignPositions,
			dignityMode: dignityMode,
		});
	}
	
	/*
	unused
	private copyWith( updates: Partial<RulershipGraphConstructorArgs> ): RulershipGraph {
		return new RulershipGraph({
			nodePositions: this.nodePositions,
			zodiacSignPositions: this.zodiacSignPositions,
			dignityMode: this.dignityMode,
			//internal
			_rulerships: this._rulerships,
			_sign: this._sign,
			_ruledBy: this._ruledBy,
			_rules: this._rules,
			_leafNodes: this._leafNodes,
			_finalDispositors: this._finalDispositors,
			_isFinalDispositor: this._isFinalDispositor,
			...updates
		});
	}
	*/
	
	public getDispositorChain(node: Node): DispositorChain{
		const chain: Node[] = [];
		var firstFinalDispositor: Node | null = null;
		var firstFinalDispositorIdx: number | null = null;
		var currentNode = node;
		var idx = 0;
		while (chain.length<10) {
			if ( firstFinalDispositor === null ){
				if (this._isFinalDispositor.get(currentNode)){
					firstFinalDispositor = currentNode;
					firstFinalDispositorIdx = idx;
				}
			} else if (currentNode == firstFinalDispositor){
				break;
			}
			idx++;
			chain.push(currentNode);
			currentNode = this._ruledBy.get(currentNode)!;
		}
		return {
			nodes: chain,
			signs: chain.map(node => this._sign.get(node)!),
			cycleStartIndex: firstFinalDispositorIdx!,
		}
	}
	
	public getDispositorChainForNonstandardNode(node: Node, sign: Zodiac): DispositorChain {
		const chain = this.getDispositorChain(this._rulerships[sign]);
		return {
			nodes: [node, ...chain.nodes],
			signs: [sign, ...chain.signs],
			cycleStartIndex: chain.cycleStartIndex + 1,
		}
	}
	
	public getRuledNodes(node: Node, transitive: boolean): Node[]{
		if (!transitive){
			return this._rules.get(node)!.filter(n => n !== node);
		}
		// otherwise, some tree search
		const transitivelyRuledNodes: Node[] = [];
		const nodesToExpand: Node[] = [...this._rules.get(node)!];
		const visited = [node];
		while (nodesToExpand.length > 0) {
			const currentNode = nodesToExpand.pop()!;
			if (this._isFinalDispositor.get(currentNode)){
				if (visited.includes(currentNode)){
					continue;
				} else {
					visited.push(currentNode);
				}
			}
			transitivelyRuledNodes.push(currentNode);
			// no satisfying way to do this in js
			for (const otherNode of this._rules.get(currentNode)!){
				nodesToExpand.push(otherNode);
			}
		}
		return transitivelyRuledNodes;
	}
	
	public getLeafNodes(): Node[]{
		return this._leafNodes;
	}
	
	public getFinalDispositors(): FinalDispositors[]{
		return this._finalDispositors;
	}
	
	public isFinalDispositor(node: Node): boolean{
		return this._isFinalDispositor.get(node)!;
	}
}
