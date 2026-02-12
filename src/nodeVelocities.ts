import { normalizeAngleRad } from './util.ts'
import { Node, lunarNodes, hamburgNodes } from './astroDefs.ts'
import { LunarNodeMode, HamburgSchoolMode } from './settingsDefs.ts'
import NodePositions from './nodePositions.ts'

const DEFAULT_TIME_DELTA_MS = 60 * 1000; // 1 minute
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function signedAngleDifference(from: number, to: number): number {
	const d = normalizeAngleRad(to - from);
	return d > Math.PI ? d - 2 * Math.PI : d;
}

function computeVelocity(base: NodePositions, progressed: NodePositions, node: Node, timeDeltaMs: number): number {
	return signedAngleDifference(base.get(node), progressed.get(node)) / (timeDeltaMs / MS_PER_DAY);
}

function findChangedNodes(oldPositions: NodePositions, newPositions: NodePositions): Node[] {
	const changed: Node[] = [];
	for (const [node, pos] of newPositions.getPositions()) {
		if (oldPositions.getPositions().get(node) !== pos) {
			changed.push(node);
		}
	}
	return changed;
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
		newVelocities.set(node, computeVelocity(base, progressed, node, timeDeltaMs));
	}
	return newVelocities;
}

function computeAllVelocities(base: NodePositions, progressed: NodePositions, timeDeltaMs: number): Map<Node, number> {
	const velocities = new Map<Node, number>();
	for (const [node] of base.getPositions()) {
		velocities.set(node, computeVelocity(base, progressed, node, timeDeltaMs));
	}
	return velocities;
}

// ============================================================================
// NodeVelocities class
// ============================================================================

interface NodeVelocitiesConstructorArgs {
	basePositions: NodePositions;
	progressedPositions: NodePositions;
	timeDeltaMs: number;
	velocities?: Map<Node, number>;
}

class NodeVelocities {
	private readonly _basePositions: NodePositions;
	private readonly _progressedPositions: NodePositions;
	private readonly _timeDeltaMs: number;
	private readonly _velocities: Map<Node, number>;

	constructor(config: NodeVelocitiesConstructorArgs) {
		this._basePositions = config.basePositions;
		this._progressedPositions = config.progressedPositions;
		this._timeDeltaMs = config.timeDeltaMs;
		this._velocities = config.velocities ?? computeAllVelocities(
			this._basePositions, this._progressedPositions, this._timeDeltaMs
		);
	}

	static create(basePositions: NodePositions, timeDeltaMs: number = DEFAULT_TIME_DELTA_MS): NodeVelocities {
		const { date, surfacePosition, lunarNodeMode, hamburgSchoolMode } = basePositions.getParams();
		const progressedPositions = NodePositions.create(
			new Date(date.getTime() + timeDeltaMs),
			surfacePosition,
			lunarNodeMode,
			hamburgSchoolMode
		);
		return new NodeVelocities({ basePositions, progressedPositions, timeDeltaMs });
	}

	private copyWith(updates: Partial<NodeVelocitiesConstructorArgs>): NodeVelocities {
		return new NodeVelocities({
			basePositions: this._basePositions,
			progressedPositions: this._progressedPositions,
			timeDeltaMs: this._timeDeltaMs,
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
		const changedNodes = findChangedNodes(this._progressedPositions, newProgressedPositions);
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

	public changeLunarNodeMode(newMode: LunarNodeMode, updatedBasePositions: NodePositions): NodeVelocities {
		const newProgressedPositions = this._progressedPositions.changeLunarNodeMode(newMode);
		return this._updatePositions(updatedBasePositions, newProgressedPositions, lunarNodes);
	}

	public changeHamburgSchoolMode(newMode: HamburgSchoolMode, updatedBasePositions: NodePositions): NodeVelocities {
		const newProgressedPositions = this._progressedPositions.changeHamburgSchoolMode(newMode);
		return this._updatePositions(updatedBasePositions, newProgressedPositions, hamburgNodes);
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
