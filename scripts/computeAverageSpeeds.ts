import { Node, NodeType, nodeTypes } from '../src/astroDefs.ts';
import { HamburgSchoolMode } from '../src/settingsDefs.ts';
import { getEclipticLongitudeSpeed } from '../src/astronomyUtil.ts';

// Sample over 300 years, every 10 days
const START_YEAR = 1800;
const END_YEAR = 2100;
const SAMPLE_INTERVAL_DAYS = 10;

const startDate = new Date(START_YEAR, 0, 1);
const endDate = new Date(END_YEAR, 0, 1);
const msPerDay = 24 * 60 * 60 * 1000;
const intervalMs = SAMPLE_INTERVAL_DAYS * msPerDay;

// Get all nodes that are BODY or HYPOTHETICAL
const validNodes = Object.values(Node).filter(node => {
	const type = nodeTypes[node];
	return type === NodeType.BODY || type === NodeType.HYPOTHETICAL;
});

console.log(`Sampling ${validNodes.length} nodes from ${START_YEAR} to ${END_YEAR}, every ${SAMPLE_INTERVAL_DAYS} days...\n`);

const results: Partial<Record<Node, number>> = {};

for (const node of validNodes) {
	let sum = 0;
	let count = 0;

	for (let t = startDate.getTime(); t < endDate.getTime(); t += intervalMs) {
		const date = new Date(t);
		try {
			const speed = getEclipticLongitudeSpeed(node, date, HamburgSchoolMode.WITTE);
			sum += Math.abs(speed);
			count++;
		} catch (e) {
			// Skip errors silently
		}
	}

	if (count > 0) {
		const avgSpeed = sum / count;
		results[node] = avgSpeed;
		// Convert radians/day to degrees/day for readability
		const degPerDay = avgSpeed * 180 / Math.PI;
		console.log(`${node.padEnd(20)} ${degPerDay.toFixed(6)}°/day  (${count} samples)`);
	}
}

console.log('\n--- Copyable output (radians/day) ---\n');
console.log('const averageSpeeds: Partial<Record<Node, number>> = {');
for (const [node, speed] of Object.entries(results)) {
	console.log(`\t[Node.${Object.entries(Node).find(([, v]) => v === node)?.[0]}]: ${speed},`);
}
console.log('};');
