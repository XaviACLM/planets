export function spreadIcons(
	positions: number[],
	angularWidth: number,
	maxIterations: number = 20
): number[] {
	const n = positions.length;

	const sortedIndices = positions.map((_, index) => index)
	.sort((a, b) => positions[a] - positions[b]);

	const sortedPositions = sortedIndices.map(idx => positions[idx]);
	let adjusted = [...sortedPositions];

	for (let iter = 0; iter < maxIterations; iter++) {
		let moved = false;

		for (let i = 0; i < n; i++) {
			const nextIdx = (i + 1) % n;

			// Handle circular wrapping - calculate the gap between current and next icon
			let gap = (adjusted[nextIdx] - adjusted[i] + 2 * Math.PI) % (2 * Math.PI);

			// If icons overlap, push them apart
			if (gap < angularWidth) {
				const overlap = angularWidth - gap;
				const pushAmount = overlap / 2;

				// Push both icons away from each other
				adjusted[i] = (adjusted[i] - pushAmount + 2 * Math.PI) % (2 * Math.PI);
				adjusted[nextIdx] = (adjusted[nextIdx] + pushAmount) % (2 * Math.PI);
				moved = true;
			}
		}

		if (!moved) break;
	}

	// Restore original order
	const finalPositions: number[] = new Array(n);
	sortedIndices.forEach((originalIndex, sortedIndex) => {
		finalPositions[originalIndex] = adjusted[sortedIndex];
	});

	return finalPositions;
}

export function normalizeAngleRad(a: number) {
	// normalize to [0, 2π)
	const twoPi = 2*Math.PI;
	return ((a % twoPi) + twoPi) % twoPi;
}

export function interpolateAngles(coeff:number, a1: number, a2: number) {
	// goes a1 -> a2, coeff 0 -> 1
	// assumes a1 and a2 are already normalized
	if (a1 < a2) {
		return (1-coeff) * a1 + coeff * a2 
	} else {
		return normalizeAngleRad((1-coeff) * a1 + coeff * (a2 + 2*Math.PI)); 
	}
}
