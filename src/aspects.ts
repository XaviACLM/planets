import { sawtoothSine, normalizeAngleRad, angleShortDistance, TAU } from './util.ts'
import { Node, AspectKind, AspectPhysicalityFilter, NodeType, nodeTypes, AspectMenuMode } from './astroDefs.ts'

export const aspectKindAngles: Record<AspectKind, number[] | null> = {
	[AspectKind.CONJUNCTION] : [0],
	[AspectKind.OPPOSITION] : [1/2],
	[AspectKind.TRINE] : [1/3],
	[AspectKind.SQUARE] : [1/4],
	[AspectKind.SEXTILE] : [1/6],
	[AspectKind.PARALLEL] : null,
	[AspectKind.CONTRAPARALLEL] : null,
    [AspectKind.VIGINTILE] : [1/20],
    [AspectKind.SEMISEXTILE] : [1/12],
    [AspectKind.UNDECILE] : [1/11],
    [AspectKind.DECILE] : [1/10],
    [AspectKind.NOVILE] : [1/9],
    [AspectKind.SEMISQUARE] : [1/8],
    [AspectKind.SEPTILE] : [1/7],
    [AspectKind.QUINTILE] : [1/5],
    [AspectKind.BINOVILE] : [2/9],
    [AspectKind.BISEPTILE] : [2/7],
    [AspectKind.TREDECILE] : [3/10],
    [AspectKind.SESQUIQUADRATE] : [3/8],
    [AspectKind.BIQUINTILE] : [2/5],
    [AspectKind.QUINCUNX] : [5/12],
    [AspectKind.TRISEPTILE] : [3/7],
    [AspectKind.QUADRANOVILE] : [4/9],
	[AspectKind.GRAND_TRINE] : [1/3, 2/3],
	[AspectKind.GRAND_SQUARE] : [1/4, 2/4, 3/4],
	[AspectKind.GRAND_SEXTILE] : [1/6, 2/6, 3/6, 4/6, 5/6],
	[AspectKind.T_SQUARE] : [1/4, 2/4],
	[AspectKind.MYSTIC_RECTANGLE] : [1/6, 3/6, 4/6],
	[AspectKind.FINGER_OF_YOD] : [2/12, 7/12],
	[AspectKind.KITE] : [2/6, 3/6, 4/6]
}

// (except contra/parallels)
const binaryAspectKinds = Object.entries(aspectKindAngles)
	.filter(([_, angles]) => angles?.length === 1)
	.map(([kind]) => kind as AspectKind);

// important that they're ordered by length so no aspect is preceded by a subaspect
const configurationAspectKinds = Object.entries(aspectKindAngles)
	.filter(([_, angles]) => angles && angles.length > 1)
	.sort(([_, a], [__, b]) => b!.length - a!.length)
	.map(([kind]) => kind as AspectKind);

// consider symmetries on each configuration.
// consider the eq. classes of vertices under these
// we provide the indices of a set of representatives of these classes
const startingVertices: Partial<Record<AspectKind, number[]>> = {
	[AspectKind.GRAND_TRINE]: [0],
	[AspectKind.GRAND_SQUARE]: [0],
	[AspectKind.GRAND_SEXTILE]: [0],
	[AspectKind.T_SQUARE]: [0, 1, 2],
	[AspectKind.MYSTIC_RECTANGLE]: [0,1],
	[AspectKind.FINGER_OF_YOD]: [0, 1, 2],
	[AspectKind.KITE]: [0, 1, 2, 3],
};

const isRegular: Partial<Record<AspectKind, boolean>> = Object.fromEntries(
	Object.entries(startingVertices).map(([kind, vertices]) => [
		kind, 
		vertices?.length === 1
	])
);

export class Aspect {
    kind: AspectKind;
    nodes: Node[];
    basisNodeIdx: number | null;
    error: number | null;

    constructor(
        kind: AspectKind,
        nodes: Node[],
        basisNodeIdx?: number | null,
        error?: number | null
    ) {
        this.kind = kind;
        this.nodes = nodes;
        this.basisNodeIdx = basisNodeIdx ?? null;
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
    if (aspect.basisNodeIdx === null) {
        aspect.nodes.sort((a, b) => nodePositions.get(a)! - nodePositions.get(b)!);
    } else {
        const nodesWithFlags = aspect.nodes.map((node, idx) => ({
            node,
            isBasis: idx === aspect.basisNodeIdx
        }));
        
        nodesWithFlags.sort((a, b) => nodePositions.get(a.node)! - nodePositions.get(b.node)!);
        
        aspect.nodes = nodesWithFlags.map(item => item.node);
        aspect.basisNodeIdx = nodesWithFlags.findIndex(item => item.isBasis);
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

function aspectError(aspect: Aspect, nodePositions: Map<Node, number>): number {
	const n = aspect.nodes;
	
	if ( binaryAspectKinds.includes(aspect.kind) ) {
		const d = angleShortDistance(nodePositions.get(n[0])!, nodePositions.get(n[1])!);
		const target = aspectKindAngles[aspect.kind][0]*TAU;
		return Math.abs(target - d);
	}
	
	if ( n.length == 2 ){
		// dealing with a contra/parallel
		const p1 = sawtoothSine(n[0]);
		const p2 = sawtoothSine(n[1]);
		return Math.abs(aspect.kind == AspectKind.PARALLEL ? p1-p2 : p1+p2);
	}
	
	const k = n.length;
	const angles = [0, ...aspectKindAngles[aspect.kind].map(angle => angle * TAU)];
	let leastError = Infinity;
	for (let offsetIdx = 0; offsetIdx < k; offsetIdx++) {
		// n (vertex) we're looking at starts at basisIdx + offsetIdx
		// idx in angles starts at offsetIdx
		let error = 0;
		const startAngle = angles[offsetIdx];
		const startIdx = (aspect.basisNodeIdx + offsetIdx) % k;
		const startPos = nodePositions.get(n[startIdx])!;
		for (let i = 1; i < k; i++) {
			const vertexIdx = (i + startIdx) % k;
			const angleIdx = (i + offsetIdx) % k;
			const idealPos = normalizeAngleRad(startPos + angles[angleIdx] - startAngle);
			const p = nodePositions.get(n[vertexIdx])!;
			error += angleShortDistance(p, idealPos);
		}
		leastError = Math.min(leastError, error);
	}

	return leastError;
}

function subaspectsOf(aspect: Aspect, nodePositions: Map<Node, number>): Aspect[] {
	// we could write this function synthetically from aspectKindAngles but that'd be pointlessly slow
	// it would be possible to precompute subaspect tables but that'd be pointlessly slow (in dev time)
	if ( binaryAspectKinds.includes(aspect.kind) ) {
		return [];
	}
	const n = aspect.nodes;
	
	const i = aspect.basisNodeIdx ?? 0;
	
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
				new Aspect(AspectKind.T_SQUARE, [n1, n2, n3], 0), //third param is basisNodeIdx
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
				new Aspect(AspectKind.SEXTILE, [n1, n2]),
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



export function findAspects(
    nodePositions: Map<Node, number>,
    maxErrorPerNode: number = 0.03
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
    const aspectConfigs = configurationAspectKinds
	.map(kind => ({
		kind,
		angles: aspectKindAngles[kind]!,
		requiresBasis: !isRegular[kind]
	}));

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
            const binaryAspects = binaryAspectKinds
				.filter(kind => aspectKindAngles[kind]?.[0] !== undefined)
				.map(kind => ({
					target: aspectKindAngles[kind]![0],
					kind
				}));


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
	
	// guaranteed everything has had its error computed
	for (const [aspect, subs] of subaspects){
		for (const subaspect of subs){
			subaspect.error = aspectError(subaspect, nodePositions);
		}
	}
	
	for (const aspect of aspects.getAllAspects()) {
		if ( !subaspects.has(aspect) ) {
			subaspects.set(aspect, []);
		}
	}

	return subaspects;

	// TODO remove this later. we'll sort in another place, keeping this code for then
	//const aspectList = aspects.getAllAspects().sort((a1, a2) => {
	//	const score1 = a1.error / a1.nodes.length - (a1.nodes.length > 2 ? 1 : 0);
	//	const score2 = a2.error / a2.nodes.length - (a2.nodes.length > 2 ? 1 : 0);
	//	return score1 - score2;
	//});
	
	// doesn't print anything, so it looks like the error we compute on-the-fly is already good
	// which is odd, I don't see why that should be the case with irregular configurations
	// might revisit this at some point
	//for ( const aspect of aspectList ){
	//	const computedError = aspectError(aspect, nodePositions) - 1e-10;
	//	if (computedError > aspect.error){
	//		console.log(aspect.kind, aspect.error, computedError);
	//	}
	//}
}

export function ensureNoDuplicates(
	subaspectMap: Map<Aspect, Aspect[]>
){
	// TODO also sort by error
	const excludedAspects = new AspectGroup();
    const sortedEntries = Array.from(subaspectMap.entries())
        .sort(([a, sa], [b, sb]) => b.nodes.length - a.nodes.length);
	subaspectMap.clear();
	for (const [aspect, subs] of sortedEntries){
		if  ( excludedAspects.contains(aspect) ){
			continue;
		}
		excludedAspects.insert(aspect);
		for (const subaspect of subs){
			excludedAspects.insert(subaspect);
		}
		subaspectMap.set(aspect, subs);
	}
}

function filterAspect(
	aspect: Aspect,
	selectedNodes: Set<Node>,
	selectedAspectKinds: Set<AspectKind>,
	aspectPhysicalityFilter: AspectPhysicalityFilter,
	hamburgPhysical: boolean
){
	const aspectSelected = selectedAspectKinds.has(aspect.kind);
	const nodesSelected = aspect.nodes.every(node => selectedNodes.has(node));
	const amtPhysical = aspect.nodes.filter(node => nodeTypes[node] == NodeType.BODY ||
							  (nodeTypes[node] == NodeType.HYPOTHETICAL && hamburgPhysical)).length;
	const amtNodes = aspect.nodes.length;
	const physicalEnough = (aspectPhysicalityFilter == AspectPhysicalityFilter.NO_PHYSICAL) ||
						   (aspectPhysicalityFilter == AspectPhysicalityFilter.ONE_PHYSICAL && amtPhysical >= 1) ||
						   (aspectPhysicalityFilter == AspectPhysicalityFilter.ALL_BUT_ONE_PHYSICAL && amtPhysical >= amtNodes - 1) ||
						   (amtPhysical == amtNodes);
	return aspectSelected && nodesSelected && physicalEnough;
}

export function filterAspects(
	subaspectMap: Map<Aspect, Aspect[]>,
	nodePositions: Map<Node, number>,
	selectedNodes: Set<Node>,
	selectedAspectKinds: Set<AspectKind>,
	aspectPhysicalityFilter: AspectPhysicalityFilter,
	hamburgPhysical: boolean
): Map<Aspect, Aspect[]>{
	//deepcopy subaspect map
	const newMap = new Map<Aspect, Aspect[]>();
    for (const [aspect, subs] of subaspectMap.entries()) {
        newMap.set(aspect, [...subs]);
    }
	
    // tasks list
    const entries: [Aspect, Aspect[]][] = Array.from(newMap.entries());
	
    let i = 0;
    while (i < entries.length) {
        const [aspect, subaspects] = entries[i];
        i++;
        // if the aspect survives filtering, keep it
        if (filterAspect(aspect, selectedNodes, selectedAspectKinds, aspectPhysicalityFilter, hamburgPhysical)) {
            continue;
        }
        // Otherwise remove it from the new map
        newMap.delete(aspect);
        // Insert its subaspects and queue them for later cleaning
        for (const subaspect of subaspects) {
            const subsubaspects = subaspectsOf(subaspect, nodePositions);
            for (const s of subsubaspects) {
                s.error = aspectError(s, nodePositions);
            }
            newMap.set(subaspect, subsubaspects);
            entries.push([subaspect, subsubaspects]);
        }
    }
    // only mutate the new map
    ensureNoDuplicates(newMap);
    return newMap;
}

function flattenSubaspects(
    subaspectMap: Map<Aspect, Aspect[]>
): Map<Aspect, Aspect[]> {
    const newMap = new Map<Aspect, Aspect[]>();
    for (const [aspect, subaspects] of subaspectMap) {
        newMap.set(aspect, []);
        for (const subaspect of subaspects) {
            newMap.set(subaspect, []);
        }
    }
    ensureNoDuplicates(newMap);
    return newMap;
}

function clearSubaspects(
    subaspectMap: Map<Aspect, Aspect[]>
): Map<Aspect, Aspect[]> {
    const newMap = new Map<Aspect, Aspect[]>();
    for (const [aspect, subaspects] of subaspectMap) {
        newMap.set(aspect, []);
    }
    return newMap;
}

function copySubaspects(
    subaspectMap: Map<Aspect, Aspect[]>
): Map<Aspect, Aspect[]> {
    const newMap = new Map<Aspect, Aspect[]>();
    for (const [aspect, subaspects] of subaspectMap) {
        newMap.set(aspect, subaspects);
    }
    return newMap;
}
	
export function formatAspects(
	subaspectMap: Map<Aspect, Aspect[]>,
	selectedAspectMenuMode: AspectMenuMode
){
	if ( selectedAspectMenuMode == AspectMenuMode.SHOW_ALL ){
		return flattenSubaspects(subaspectMap);
	} else if ( selectedAspectMenuMode == AspectMenuMode.SHOW_ONLY_MAXIMAL ){
		return clearSubaspects(subaspectMap);
	} else if ( selectedAspectMenuMode == AspectMenuMode.SHOW_MAXIMAL_WITH_SUBMENUS ){
		return copySubaspects(subaspectMap);
	}
}

export function flattenSubaspectsToList(
    subaspectMap: Map<Aspect, Aspect[]>
): Map<Aspect, Aspect[]> {
	return Array.from(flattenSubaspects(subaspectMap).keys());
}


// TODO re aspects

// XX create subaspect menu

//  make sure that the aspect deletion still works alright

//  figure out the stuff with the parallels diagram and the fixed stars. what do we want, really?
//  if it does do fixed star stuff then deactivate that hide/unhide thing

//  the business with how error is aggregated into configurations. very complicated...
//  is it complicated, though? It should be doable
//  what's more annoying, really, is the business with the orbs-per-aspect
//  but it's mostly annoying because I don't know how to set up the UI. rest is easy.

//  real constellations mode

//  the whole node spacing thing can move things over the 0/2pi line, which is fine for zodiac wheel but looks really weird for the parallel diagram