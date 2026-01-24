import { Node, Zodiac, standardNodes, classicalRulerships, modernRulerships } from './astroDefs';
import { DignityMode } from './settingsDefs.ts'
import ZodiacPositions from './zodiacPositions.ts'

// this approach (to get copyWith) is actually unnecessary since changing either main arg results in full recomputation
// but might be useful to keep it like this for later
// and it wouldn't be impossible to avoid recomputation, actually, at the very least ruledBy is very redundant. but...

function constructRulershipGraphInternals(zodiacPositions: ZodiacPositions, dignityMode: DignityMode) {
		
	const rulerships = dignityMode === DignityMode.CLASSICAL ? classicalRulerships : modernRulerships;
	
	// TODO this code is kinda inelegant. a lot of this could be functionalish one-linerish i bet
	const rules: Map<Node, Node[]> = new Map(standardNodes.map(node => [node, []]));
	const ruledBy = new Map<Node, Node>();
	const sign = new Map<Node, Zodiac>();
	for ( const node of standardNodes ){
		const symbol = zodiacPositions.getSymbolOfNode(node);
		const ruler = rulerships[symbol]
		ruledBy.set(node, ruler);
		rules.get(ruler).push(node);
		sign.set(node, symbol);
	}
	
	const leafNodes: Node[] = standardNodes.filter(node => rules.get(node).length == 0);
	
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
			currentNode = ruledBy.get(currentNode);
		}
	}
	
	return { sign, ruledBy, rules, leafNodes, finalDispositors, isFinalDispositor };
}

export interface DispositorChain {
	chain: Node[];
	cycleStartIndex: number;
}

interface RulershipGraphConstructorArgs {
	zodiacPositions: ZodiacPositions,
	dignityMode: DignityMode,
	// internal
	_sign?: Map<Node, Zodiac>;
	_ruledBy?: Map<Node, Node>;
	_rules?: Map<Node, Node[]>;
	_leafNodes?: Node[];
	_finalDispositors?: Node[][];
	_isFinalDispositor?: Map<Node, boolean>;
}

export class RulershipGraph {
	public readonly zodiacPositions: ZodiacPositions;
	public readonly dignityMode: DignityMode;
	
	private readonly _sign: Map<Node, Zodiac>;
	private readonly _ruledBy: Map<Node, Node>;
	private readonly _rules: Map<Node, Node[]>;
	private readonly _leafNodes: Node[];
	private readonly _finalDispositors: Node[][];
	private readonly _isFinalDispositor: Map<Node, boolean>;
	
	constructor( config: ZodiacPositionsConstructorArgs ){
		this.zodiacPositions = config.zodiacPositions;
		this.dignityMode = config.dignityMode;
		
		if (config._ruledBy) {
			this._ruledBy = config._ruledBy;
			this._rules = config._rules;
			this._leafNodes = config._leafNodes;
			this._finalDispositors = config._finalDispositors;
			this._isFinalDispositor = config._isFinalDispositor;
			return;
		} else {
			const { sign, ruledBy, rules, leafNodes, finalDispositors, isFinalDispositor } = constructRulershipGraphInternals(this.zodiacPositions, this.dignityMode);
			this._sign = sign;
			this._ruledBy = ruledBy;
			this._rules = rules;
			this._leafNodes = leafNodes;
			this._finalDispositors = finalDispositors;
			this._isFinalDispositor = isFinalDispositor;	
		}
	}
	
	static create(
		zodiacPositions: ZodiacPositions,
		dignityMode: DignityMode,
	): RulershipGraph {
		return new RulershipGraph({
			zodiacPositions: zodiacPositions,
			dignityMode: dignityMode,
		});
	}
	
	private copyWith( updates: Partial<RulershipGraphConstructorArgs> ): RulershipGraph {
		return new RulershipGraph({
			zodiacPositions: this.zodiacPositions,
			dignityMode: this.dignityMode,
			//internal
			_sign: this._sign,
			_ruledBy: this._ruledBy,
			_rules: this._rules,
			_leafNodes: this._leafNodes,
			_finalDispositors: this._finalDispositors,
			_isFinalDispositor: this._isFinalDispositor,
			...updates
		});
	}
	
	public getDispositorChain(node: Node): DispositorChain{
		const chain = [];
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
			currentNode = this._ruledBy.get(currentNode);
		}
		return {
			chain: chain,
			cycleStartIndex: firstFinalDispositorIdx,
		}
	}
	
	public getRuledNodes(node: Node, transitive: boolean): Node[]{
		// TODO unclear how this should work with final dispositors, esp. if not in single reception
		if (!transitive){
			return this._rules.get(node);
		}
		// otherwise, some tree search
		const transitivelyRuledNodes: Node[] = [];
		const nodesToExpand: Node[] = this._rules.get(node);
		while (nodesToExpand.length > 0) {
			const currentNode = nodesToExpand.pop();
			transitivelyRuledNodes.push(currentNode);
			// no satisfying way to do this in js
			for (const otherNode of this._rules.get(currentNode)){
				nodesToExpand.push(otherNode);
			}
		}
		return transitivelyRuledNodes;
		
	}
	
	public getLeafNodes(): Node[]{
		return this._leafNodes;
	}
	
	public getFinalDispositors(): Node[][]{
		return this._finalDispositors;
	}
	
	public getSign(node: Node): Zodiac {
		return this._sign.get(node);
	}
}
