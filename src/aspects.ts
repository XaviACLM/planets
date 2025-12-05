import { sawtoothSine, normalizeAngleRad, angleShortDistance } from './util.ts'
import { Node } from './astroDefs.ts'


export const AspectKind = {
	// major binary
	CONJUNCTION: "Conjunction", // 0
	OPPOSITION: "Opposition", // 1/2
	TRINE: "Trine", // 1/3
	SQUARE: "Square", // 1/4
	SEXTILE: "Sextile", // 1/6
	PARALLEL: "Parallel",  // same eq. latitude
	CONTRAPARALLEL: "Contraparallel", // opposite eq. latitude
	
	// minor binary
    VIGINTILE: "Vigintile", // 1/20
    SEMISEXTILE: "Semisextile", // 1/12
    UNDECILE: "Undecile", // 1/11
    DECILE: "Decile", // 1/10
    NOVILE: "Novile", // 1/9
    SEMISQUARE: "Semisquare", // 1/8
    SEPTILE: "Septile", // 1/7
    QUINTILE: "Quintile", // 1/5
    BINOVILE: "Binovile", // 2/9
    BISEPTILE: "Biseptile", // 2/7
    TREDECILE: "Tredecile", // 3/10
    SESQUIQUADRATE: "Sesquiquadrate", // 3/8
    BIQUINTILE: "Biquintile", // 2/5
    QUINCUNX: "Quincunx", // 5/12
    TRISEPTILE: "Triseptile", // 3/7
    QUADRANOVILE: "Quadranovile", // 4/9
	
	// configurations
	GRAND_TRINE: "Grand Trine", // 3 in trines
	GRAND_SQUARE: "Grand Square", // 4 in consecutive squares
	GRAND_SEXTILE: "Grand Sextile", // 6 in consecutive sextiles
	T_SQUARE: "T-Square", // a square missing one node
	MYSTIC_RECTANGLE: "Mystic Rectangle", // grand sextile missing two opposed nodes
	FINGER_OF_YOD: "Finger of Yod", // two nodes in sextile are quincunx a third
	KITE: "Kite", // grand sextile missing nodes 1 and 3
} as const;
export type AspectKind = typeof AspectKind[keyof typeof AspectKind];

export class Aspect {
    kind: AspectKind;
    nodes: Node[];
    basis_node_idx: number | null;
    error: number | null;

    constructor(
        kind: AspectKind,
        nodes: Node[],
        basis_node_idx?: number | null,
        error?: number | null
    ) {
        this.kind = kind;
        this.nodes = nodes;
        this.basis_node_idx = basis_node_idx ?? null;
        this.error = error ?? null;
    }
}

// nodes are always ordered increasingly by their position 0-2pi
// basis node is only present for non-regular grand aspects (t-square, rectangle, yod, kite)
// it specifies an index at which we can start reading the node list (with wraparound) and be sure that the nodes come in a certain order w.r.t. the aspect's structure
// for t-square, this means the inter-node angles will be 90, 90 (180)
// for rectangle, 60, 120, 60, (120)
// for yod, 30, 165 (165)
// for kite, 120, 60, 60, (120)

function ensureCorrectOrderingInAspect(aspect: Aspect, nodePositions: Map<Node, number>): void {
    if (aspect.basis_node_idx === null) {
        aspect.nodes.sort((a, b) => nodePositions.get(a)! - nodePositions.get(b)!);
    } else {
        const nodesWithFlags = aspect.nodes.map((node, idx) => ({
            node,
            isBasis: idx === aspect.basis_node_idx
        }));
        
        nodesWithFlags.sort((a, b) => nodePositions.get(a.node)! - nodePositions.get(b.node)!);
        
        aspect.nodes = nodesWithFlags.map(item => item.node);
        aspect.basis_node_idx = nodesWithFlags.findIndex(item => item.isBasis);
    }
}

function ensureCorrectOrderingInAspectList(
    aspectList: Aspect[], 
    nodePositions: Map<Node, number>
): void {
    for (const aspect of aspectList) {
        ensureCorrectOrderingInAspect(aspect, nodePositions);
    }
}

function subaspectsOf(aspect: Aspect, nodePositions: Map<Node, number>): Aspect[] {
	const n = aspect.nodes;
	if (n.length==2) return [];
	
	const i = aspect.basis_node_idx ?? 0;
	
	switch (aspect.kind) {
		case AspectKind.GRAND_TRINE: {
			const [n1, n2, n3] = n;
			return [
				new Aspect(AspectKind.TRINE, [n1, n2]),
				new Aspect(AspectKind.TRINE, [n2, n3]),
				new Aspect(AspectKind.TRINE, [n1, n3]),
			];
		}
		case AspectKind.GRAND_SQUARE: {
			const [n1, n2, n3, n4] = n;
			return [
				new Aspect(AspectKind.SQUARE, [n1, n2]),
				new Aspect(AspectKind.SQUARE, [n2, n3]),
				new Aspect(AspectKind.SQUARE, [n3, n4]),
				new Aspect(AspectKind.SQUARE, [n1, n4]),
				new Aspect(AspectKind.OPPOSITION, [n1, n3]),
				new Aspect(AspectKind.OPPOSITION, [n2, n4]),
				new Aspect(AspectKind.T_SQUARE, [n1, n2, n3], 0), //third param is basis_node_idx
				new Aspect(AspectKind.T_SQUARE, [n2, n3, n4], 0),
				new Aspect(AspectKind.T_SQUARE, [n1, n3, n4], 1),
				new Aspect(AspectKind.T_SQUARE, [n1, n2, n4], 2),
			];
		}
		case AspectKind.GRAND_SEXTILE: {
			const [n1, n2, n3, n4, n5, n6] = n;
			return [
				new Aspect(AspectKind.SQUARE, [n1, n2]),
				new Aspect(AspectKind.SQUARE, [n2, n3]),
				new Aspect(AspectKind.SQUARE, [n3, n4]),
				new Aspect(AspectKind.SQUARE, [n4, n5]),
				new Aspect(AspectKind.SQUARE, [n5, n6]),
				new Aspect(AspectKind.SQUARE, [n1, n6]),
				new Aspect(AspectKind.TRINE, [n1, n3]),
				new Aspect(AspectKind.TRINE, [n3, n5]),
				new Aspect(AspectKind.TRINE, [n1, n5]),
				new Aspect(AspectKind.TRINE, [n2, n4]),
				new Aspect(AspectKind.TRINE, [n4, n6]),
				new Aspect(AspectKind.TRINE, [n2, n6]),
				new Aspect(AspectKind.OPPOSITION, [n1, n4]),
				new Aspect(AspectKind.OPPOSITION, [n2, n4]),
				new Aspect(AspectKind.OPPOSITION, [n3, n6]),
				new Aspect(AspectKind.GRAND_TRINE, [n1, n3, n5]),
				new Aspect(AspectKind.GRAND_TRINE, [n2, n4, n6]),
				new Aspect(AspectKind.MYSTIC_RECTANGLE, [n1, n2, n4, n5], 0),
				new Aspect(AspectKind.MYSTIC_RECTANGLE, [n2, n3, n5, n6], 0),
				new Aspect(AspectKind.MYSTIC_RECTANGLE, [n1, n3, n4, n6], 1),
				new Aspect(AspectKind.KITE, [n1, n3, n4, n5], 0),
				new Aspect(AspectKind.KITE, [n2, n4, n5, n6], 0),
				new Aspect(AspectKind.KITE, [n1, n3, n5, n6], 1),
				new Aspect(AspectKind.KITE, [n1, n2, n4, n6], 2),
				new Aspect(AspectKind.KITE, [n1, n2, n3, n5], 3),
				new Aspect(AspectKind.KITE, [n2, n3, n4, n6], 3),
			];
		}
		case AspectKind.T_SQUARE: {
			const [n1, n2, n3] = [...n.slice(i), ...n.slice(0, i)];
			const subaspects = [
				new Aspect(AspectKind.SQUARE, [n1, n2]),
				new Aspect(AspectKind.SQUARE, [n2, n3]),
				new Aspect(AspectKind.OPPOSITION, [n1, n3]),
			];
			ensureCorrectOrderingInAspectList(subaspects, nodePositions);
			return subaspects;
		}
		case AspectKind.MYSTIC_RECTANGLE: {
			const [n1, n2, n3, n4] = [...n.slice(i), ...n.slice(0, i)];
			const subaspects = [
				new Aspect(AspectKind.SEXTILE, [n1, n2]),
				new Aspect(AspectKind.TRINE, [n2, n3]),
				new Aspect(AspectKind.SEXTILE, [n3, n4]),
				new Aspect(AspectKind.TRINE, [n1, n4]),
				new Aspect(AspectKind.OPPOSITION, [n1, n3]),
				new Aspect(AspectKind.OPPOSITION, [n2, n4]),
			];
			ensureCorrectOrderingInAspectList(subaspects, nodePositions);
			return subaspects;
		}
		case AspectKind.FINGER_OF_YOD: {
			const [n1, n2, n3] = [...n.slice(i), ...n.slice(0, i)];
			const subaspects = [
				new Aspect(AspectKind.SQUARE, [n1, n2]),
				new Aspect(AspectKind.QUINCUNX, [n2, n3]),
				new Aspect(AspectKind.QUINCUNX, [n1, n3]),
			];
			ensureCorrectOrderingInAspectList(subaspects, nodePositions);
			return subaspects;
		}
		case AspectKind.KITE: {
			const [n1, n2, n3, n4] = [...n.slice(i), ...n.slice(0, i)];
			const subaspects = [
				new Aspect(AspectKind.TRINE, [n1, n2]),
				new Aspect(AspectKind.OPPOSITION, [n1, n3]),
				new Aspect(AspectKind.TRINE, [n1, n4]),
				new Aspect(AspectKind.SEXTILE, [n2, n3]),
				new Aspect(AspectKind.TRINE, [n2, n4]),
				new Aspect(AspectKind.SEXTILE, [n3, n4]),
				new Aspect(AspectKind.GRAND_TRINE, [n1, n2, n4]),
			];
			ensureCorrectOrderingInAspectList(subaspects, nodePositions);
			return subaspects;
		}
	}
}

class AspectGroup {
    private aspects: Map<string, Aspect> = new Map();
    
    private static key(aspect: Aspect): string {
		// technically doesn't guarantee equality, but works for any reasonable max error value
        return `${aspect.kind}:${aspect.nodes.join(',')}`;
    }
    
    insert(aspect: Aspect): void {
        const key = AspectGroup.key(aspect);
        const presentAspect = this.aspects.get(key);
        
        if (
            presentAspect === undefined || 
            presentAspect.error === null || 
            (presentAspect.error > aspect.error)
        ) {
            this.aspects.set(key, aspect);
        }
    }
    
    contains(aspect: Aspect): boolean {
        return this.aspects.has(AspectGroup.key(aspect));
    }

	getAllAspects(): Aspect[] {
		return Array.from(this.aspects.values());
	}
}

const TAU = 2*Math.PI;

export function findAspects(
    nodePositions: Map<Node, number>,
    maxErrorPerNode: number = 0.01
): Aspect[] {

    // should be unnecessary, but let's make sure
    for (const [node, position] of nodePositions.entries()) {
        nodePositions.set(node, normalizeAngleRad(position));
    }

    // canonical ordering during search
    const orderedNodes = Array.from(nodePositions.keys()).sort(
        (a, b) => (nodePositions.get(a)!) - (nodePositions.get(b)!)
    );

    const aspects = new AspectGroup(); // holds every aspect we find
    const subaspects = new Map<Aspect, Aspect[]>(); // maps every aspect to its subaspects
    const excludedAspects = new AspectGroup(); // holds every subaspect of an aspect we've found, to avoid reintroduction
	




    // we start with the grands, in a reverse topological order of inclusion
    // grand sextile, kite, grand square, finger of yod, mystic rectangle, t-square, grand trine
    // populate and use aspects, subaspects, and excluded_aspects during search
    const aspectConfigs = [
        { kind: AspectKind.GRAND_SEXTILE, angles: [1/6, 2/6, 3/6, 4/6, 5/6], requiresBasis: false },
        { kind: AspectKind.KITE, angles: [2/6, 3/6, 4/6], requiresBasis: true },
        { kind: AspectKind.GRAND_SQUARE, angles: [1/4, 2/4, 3/4], requiresBasis: false },
        { kind: AspectKind.FINGER_OF_YOD, angles: [2/12, 7/12], requiresBasis: true },
        { kind: AspectKind.MYSTIC_RECTANGLE, angles: [1/6, 3/6, 4/6], requiresBasis: true },
        { kind: AspectKind.T_SQUARE, angles: [1/4, 2/4], requiresBasis: true },
        { kind: AspectKind.GRAND_TRINE, angles: [1/3, 2/3], requiresBasis: false },
    ];

    for (const config of aspectConfigs) {
        const { kind, angles, requiresBasis } = config;
        const scaledAngles = angles.map(angle => angle * TAU);
        const numVertices = scaledAngles.length + 1;

        for (const basisNode of orderedNodes) {
            const basisPosition = nodePositions.get(basisNode)!;
            
            // node_error[vertex_idx][node] = how far away node at idx is from the required position to be the vertex-idx-th vertex of the aspect
            let nodeErrors: Array<Map<Node, number>> = scaledAngles.map(angle => {
                const vertexError = new Map<Node, number>();
                for (const node of orderedNodes) {
                    const position = nodePositions.get(node)!;
                    //const error = Math.abs(((position - basisPosition) % TAU) - angle);
                    const error = angleShortDistance(normalizeAngleRad(basisPosition + angle), position);
                    vertexError.set(node, error);
                }
                return vertexError;
            });

            // remove everything above max error
            nodeErrors = nodeErrors.map(vertexError => {
                const filtered = new Map<Node, number>();
                for (const [node, error] of vertexError.entries()) {
                    if (error < numVertices * maxErrorPerNode) {
                        filtered.set(node, error);
                    }
                }
                return filtered;
            });

            const aspectsOnBasis: Aspect[] = [];

            // complicated search time. dfs but exhaustive and with error
            const search = (currentNodes: Node[], currentError: number, depth: number): void => {
                if (currentError >= numVertices * maxErrorPerNode) {
                    return;
                }
                if (depth + 1 === numVertices) {
                    // we could make things complicated here to ensure correct node ordering
                    // but we don't. we'll just reorder these later.
                    // for now, all we do is point at the basis idx if necessary
                    aspectsOnBasis.push(
                        new Aspect(
                            kind,
                            currentNodes,
                            requiresBasis ? 0 : null,
                            currentError
                        )
                    );
                    return;
                }
                
                const currentDepthErrors = nodeErrors[depth];
                for (const [node, localError] of currentDepthErrors.entries()) {
                    search([...currentNodes, node], currentError + localError, depth + 1);
                }
            };

            // do search
            search([basisNode], 0, 0);

            // ensure correct ordering
            ensureCorrectOrderingInAspectList(aspectsOnBasis, nodePositions);

            // update aspects, excluded_aspects, subaspects
            for (const aspect of aspectsOnBasis) {
                if (excludedAspects.contains(aspect)) {
                    continue;
                }
                aspects.insert(aspect);
                const subs = subaspectsOf(aspect, nodePositions);
                subaspects.set(aspect, subs);
                for (const subaspect of subs) {
                    excludedAspects.insert(subaspect);
                }
            }
        }
    }
    // then the binary aspects. just do pairwise
    for (let idx = 0; idx < orderedNodes.length; idx++) {
        const n1 = orderedNodes[idx];
        for (let j = idx + 1; j < orderedNodes.length; j++) {
            const n2 = orderedNodes[j];
            const p1 = nodePositions.get(n1)!;
            const p2 = nodePositions.get(n2)!;
            const d = angleShortDistance(p1, p2);

            // standard binary aspects
            const binaryAspects = [
                { target: 0, kind: AspectKind.CONJUNCTION },
                { target: 1/2, kind: AspectKind.OPPOSITION },
                { target: 1/3, kind: AspectKind.TRINE },
                { target: 1/4, kind: AspectKind.SQUARE },
                { target: 1/6, kind: AspectKind.SEXTILE },
                { target: 1/20, kind: AspectKind.VIGINTILE },
                { target: 1/12, kind: AspectKind.SEMISEXTILE },
                { target: 1/11, kind: AspectKind.UNDECILE },
                { target: 1/10, kind: AspectKind.DECILE },
                { target: 1/9, kind: AspectKind.NOVILE },
                { target: 1/8, kind: AspectKind.SEMI_SQUARE },
                { target: 1/7, kind: AspectKind.SEPTILE },
                { target: 1/5, kind: AspectKind.QUINTILE },
                { target: 2/9, kind: AspectKind.BINOVILE },
                { target: 2/7, kind: AspectKind.BISEPTILE },
                { target: 3/10, kind: AspectKind.TREDECILE },
                { target: 3/8, kind: AspectKind.SESQUIQUADRATE },
                { target: 2/5, kind: AspectKind.BIQUINTILE },
                { target: 5/12, kind: AspectKind.QUINCUNX },
                { target: 3/7, kind: AspectKind.TRISEPTILE },
                { target: 4/9, kind: AspectKind.QUADRANOVILE },
            ];

            for (const { target, kind } of binaryAspects) {
                const error = Math.abs(d - target * TAU);
                if (error < 2 * maxErrorPerNode) {
                    const aspect = new Aspect(kind, [n1, n2], null, error);
                    if (!excludedAspects.contains(aspect)) {
                        aspects.insert(aspect);
                    }
                }
            }

            // paralells / contraparallels: skip if conjunct
            if (d < 2 * maxErrorPerNode) {
                continue;
            }
            
            // otherwise do the usual sawtooth approach
            // Assuming sawtoothSine is defined elsewhere
            const s1 = sawtoothSine(p1);
            const s2 = sawtoothSine(p2);
            
            let error = Math.abs(s1 - s2);
            if (error < 2 * maxErrorPerNode) {
                const aspect = new Aspect(AspectKind.PARALLEL, [n1, n2], null, error);
                if (!excludedAspects.contains(aspect)) {
                    aspects.insert(aspect);
                }
            }
            
            error = Math.abs(s1 + s2);
            if (error < 2 * maxErrorPerNode) {
                const aspect = new Aspect(AspectKind.CONTRAPARALLEL, [n1, n2], null, error);
                if (!excludedAspects.contains(aspect)) {
                    aspects.insert(aspect);
                }
            }
        }
    }

    return [aspects.getAllAspects(), subaspects];
}