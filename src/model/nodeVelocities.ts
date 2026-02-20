import { normalizeAngleRad } from '../util/util.ts'
import { Node, lunarNodes, hamburgNodes, highDependencyArabicParts } from '../defs/astroDefs.ts'
import { LunarNodeMode, HamburgSchoolMode, DignityMode } from '../defs/settingsDefs.ts'
import NodePositions from './nodePositions.ts'
import ZodiacSignPositions from './zodiacSignPositions.ts'
import HouseCuspPositions from './houseCuspPositions.ts'

const DEFAULT_TIME_DELTA_MS = 60 * 1000; // 1 minute
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function signedAngleDifference(from: number, to: number): number {
	const d = normalizeAngleRad(to - from);
	return d > Math.PI ? d - 2 * Math.PI : d;
}

function computeVelocity(base: NodePositions, progressed: NodePositions, node: Node, timeDeltaMs: number): number | null {
	if (!(base.has(node) && progressed.has(node))){
		return null; // meaning "remove this value"
	}
	return signedAngleDifference(base.get(node), progressed.get(node)) / (timeDeltaMs / MS_PER_DAY);
}

function recomputeVelocitiesForNodes(
	base: NodePositions,
	progressed: NodePositions,
	timeDeltaMs: number,
	existingVelocities: Map<Node, number>,
	nodes: Node[]
): Map<Node, number> {
	const newVelocities = new Map(existingVelocities);
	for (const node of nodes) {
		const newVelocity = computeVelocity(base, progressed, node, timeDeltaMs);
		if (newVelocity === null) {
			newVelocities.delete(node);
		} else {
			newVelocities.set(node, newVelocity);
		}
	}
	return newVelocities;
}

function computeAllVelocities(base: NodePositions, progressed: NodePositions, timeDeltaMs: number): Map<Node, number> {
	const velocities = new Map<Node, number>();
	for (const [node] of base.getPositions()) {
		const velocity = computeVelocity(base, progressed, node, timeDeltaMs);
		if (velocity !== null){
			velocities.set(node, velocity);
		}
	}
	return velocities;
}

// ============================================================================
// NodeVelocities class
// ============================================================================

interface NodeVelocitiesConstructorArgs {
	basePositions: NodePositions;
	timeDeltaMs: number;
	progressedPositions: NodePositions;
	velocities: Map<Node, number>;
}

class NodeVelocities {
	// dependencies
	private readonly _basePositions: NodePositions;
	private readonly _timeDeltaMs: number;
	
	// logical state
	private readonly _progressedPositions: NodePositions;
	private readonly _velocities: Map<Node, number>;

	constructor(config: NodeVelocitiesConstructorArgs) {
		this._basePositions = config.basePositions;
		this._timeDeltaMs = config.timeDeltaMs;
		this._progressedPositions = config.progressedPositions;
		this._velocities = config.velocities;
	}

	static create(basePositions: NodePositions, timeDeltaMs: number = DEFAULT_TIME_DELTA_MS): NodeVelocities {
		const { date, surfacePosition, lunarNodeMode, hamburgSchoolMode, houseCuspPositions, zodiacSignPositions, dignityMode } = basePositions.getParams();
		const progressedPositions = NodePositions.create(
			new Date(date.getTime() + timeDeltaMs),
			surfacePosition,
			lunarNodeMode,
			hamburgSchoolMode,
			houseCuspPositions,
			zodiacSignPositions,
			dignityMode
		);
		const velocities = computeAllVelocities(
			basePositions, progressedPositions, timeDeltaMs
		);
		return new NodeVelocities({ basePositions, timeDeltaMs, progressedPositions, velocities });
	}

	private copyWith(updates: Partial<NodeVelocitiesConstructorArgs>): NodeVelocities {
		return new NodeVelocities({
			basePositions: this._basePositions,
			timeDeltaMs: this._timeDeltaMs,
			progressedPositions: this._progressedPositions,
			velocities: this._velocities,
			...updates
		});
	}

	// Shared logic for changeXYZ methods: updates both position sets,
	// recomputes velocities only for the passed nodes
	private _updatePositions(
		newBasePositions: NodePositions,
		newProgressedPositions: NodePositions,
		changedNodes: Node[],
	): NodeVelocities {
		const newVelocities = recomputeVelocitiesForNodes(
			newBasePositions, newProgressedPositions, this._timeDeltaMs,
			this._velocities, changedNodes
		);
		return this.copyWith({
			basePositions: newBasePositions,
			progressedPositions: newProgressedPositions,
			velocities: newVelocities,
		});
	}

	public changeBasePositionsWithLunarNodeMode(updatedBasePositions: NodePositions, newMode: LunarNodeMode): NodeVelocities {
		const newProgressedPositions = this._progressedPositions.changeLunarNodeMode(newMode);
		return this._updatePositions(updatedBasePositions, newProgressedPositions, lunarNodes);
	}

	public changeBasePositionsWithHamburgSchoolMode(updatedBasePositions: NodePositions, newMode: HamburgSchoolMode): NodeVelocities {
		const newProgressedPositions = this._progressedPositions.changeHamburgSchoolMode(newMode);
		return this._updatePositions(updatedBasePositions, newProgressedPositions, hamburgNodes);
	}

	public changeBasePositionsWithHouseCuspPositions(updatedBasePositions: NodePositions, houseCuspPositions: HouseCuspPositions | null): NodeVelocities {
		const newProgressedPositions = this._progressedPositions.changeHouseCuspPositions(houseCuspPositions);
		return this._updatePositions(updatedBasePositions, newProgressedPositions, highDependencyArabicParts);
	}

	public changeBasePositionsWithZodiacSignPositionsAndHouseCuspPositions(
		updatedBasePositions: NodePositions,
		zodiacSignPositions: ZodiacSignPositions,
		houseCuspPositions: HouseCuspPositions | null,
	): NodeVelocities {
		const newProgressedPositions = this._progressedPositions.changeZodiacSignPositionsAndHouseCuspPositions(zodiacSignPositions, houseCuspPositions);
		return this._updatePositions(updatedBasePositions, newProgressedPositions, highDependencyArabicParts);
	}

	public changeBasePositionsWithDignityMode(updatedBasePositions: NodePositions, dignityMode: DignityMode): NodeVelocities {
		const newProgressedPositions = this._progressedPositions.changeDignityMode(dignityMode);
		return this._updatePositions(updatedBasePositions, newProgressedPositions, highDependencyArabicParts);
	}
	
	// Returns velocity in rad/day
	public get(node: Node): number {
		const v = this._velocities.get(node);
		if (v === undefined) { throw new Error(`NodeVelocities.get called for absent node: ${node}`); }
		return v;
	}

	public getVelocities(): Map<Node, number> {
		return this._velocities;
	}
}

export default NodeVelocities;
