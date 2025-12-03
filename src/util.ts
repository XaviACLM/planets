import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export function toZonedTime(date: Date, tz: string) {
	const d = dayjs(date).tz(tz);
	const offsetMs = (d.utcOffset()+0) * 60 * 1000;
	return new Date(date.getTime() + offsetMs);
}
export function fromZonedTime(date: Date, tz: string) {
	const d = dayjs(date).tz(tz);
	const offsetMs = (d.utcOffset() - 60) * 60 * 1000;
	return new Date(date.getTime() - offsetMs);
}

export function spreadIcons(
	positions: number[],
	angularWidth: number,
	maxIterations: number = 50
): number[] {
	const n = positions.length;
	
	positions = positions.map(normalizeAngleRad);

	const sortedIndices = positions.map((_, index) => index)
	.sort((a, b) => positions[a] - positions[b]);

	const sortedPositions = sortedIndices.map(idx => positions[idx]);
	let adjusted = [...sortedPositions];

	for (let iter = 0; iter < maxIterations; iter++) {
		let moved = false;

		for (let i = 0; i < n; i++) {
			const nextIdx = (i + 1) % n;

			let gap = (adjusted[nextIdx] - adjusted[i] + 2 * Math.PI) % (2 * Math.PI);

			if (gap < angularWidth) {
				const overlap = angularWidth - gap;
				const pushAmount = overlap / 2;
				
				const prevIdx = (i - 1 + n) % n;
				const nextNextIdx = (nextIdx + 1) % n;
				const maxBackwardPush = (adjusted[i] - adjusted[prevIdx] + 2 * Math.PI) % (2 * Math.PI);
				const maxForwardPush = (adjusted[nextNextIdx] - adjusted[nextIdx] + 2 * Math.PI) % (2 * Math.PI);
				const forwardPush = Math.min(pushAmount, maxForwardPush);
				const backwardPush = Math.min(pushAmount, maxBackwardPush);

				// Push both icons away from each other
				adjusted[i] = (adjusted[i] - backwardPush + 2 * Math.PI) % (2 * Math.PI);
				adjusted[nextIdx] = (adjusted[nextIdx] + forwardPush) % (2 * Math.PI);
				moved = true;
			}
		}

		if (!moved) break;
	}

	const finalPositions: number[] = new Array(n);
	sortedIndices.forEach((originalIndex, sortedIndex) => {
		finalPositions[originalIndex] = adjusted[sortedIndex];
	});

	return finalPositions;
}

export function normalizeAngleRad(a: number) {
	// normalize to [0, 2pi)
	const twoPi = 2*Math.PI;
	return ((a % twoPi) + twoPi) % twoPi;
}

export function normalizeAngleDeg(a: number) {
	// normalize to [0, 360)
	return ((a % 360) + 360) % 360;
}

export function interpolateAngles(coeff:number, a1: number, a2: number) {
	// goes a1 -> a2, increasing, as coeff 0 -> 1
	// assumes a1 and a2 are already normalized
	if (a1 < a2) {
		return (1-coeff) * a1 + coeff * a2 
	} else {
		return normalizeAngleRad((1-coeff) * a1 + coeff * (a2 + 2*Math.PI)); 
	}
}

export function interpolateShorterAngle(coeff:number, a1: number, a2: number) {
	// goes a1 -> a2, on whichever side is shorter, coeff 0 -> 1
	// assumes a1 and a2 are already normalized
	const diff = normalizeAngleRad(a2-a1);
	if (diff < Math.PI) {
		// increasing direction
		return normalizeAngleRad(a1 + coeff*diff);
	} else {
		// decreasing direction
		return normalizeAngleRad(a1 - coeff*(2*Math.PI - diff));
	}
}

function angleShortDistance(a: number, b: number) {
	// returns the length of the shorter of the two AB arcs
	const d = normalizeAngleRad(a-b);
	const td = d > Math.PI ? 2*Math.PI - d : d;
	return td;
}

export function anglesLieInShortArc(a: number, b: number, c:number) {
	// checks that the AC arc that is <pi contains b, i.e. a->b->c is short
	const error = angleShortDistance(a, b) + angleShortDistance(b, c) - angleShortDistance(a,c);
	return error < 1e-10;
}

export function sawtoothSine(x: number): number{
	// takes a normalized angle in radians
	if (x < Math.PI/2) {
		return x;
	} else if (x < 3*Math.PI/2) {
		return Math.PI - x;
	} else {
		return x - 2*Math.PI;
	}
}
