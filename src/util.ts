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
