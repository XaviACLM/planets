import { Node, NodeType, nodeTypes, ZodiacMode } from '../src/astroDefs.ts';
import { HamburgSchoolMode, LunarNodeMode, DignityMode, HouseSystem} from '../src/settingsDefs.ts';
import { getEclipticLongitudeSpeed } from '../src/astronomyUtil.ts';

import NodePositions from '../src/nodePositions.ts'
import NodeVelocities from '../src/nodeVelocities.ts'
import ZodiacSignPositions from '../src/zodiacSignPositions.ts'
import HouseCuspPositions from '../src/houseCuspPositions.ts'

import type { CityData } from '../src/CitySearchEngine.ts'

// Sample over 300 years, every 10 days
const START_YEAR = 1800;
const END_YEAR = 2100;
const SAMPLE_INTERVAL_DAYS = 10;

const startDate = new Date(START_YEAR, 0, 1);
const endDate = new Date(END_YEAR, 0, 1);
const msPerDay = 24 * 60 * 60 * 1000;
const intervalMs = SAMPLE_INTERVAL_DAYS * msPerDay;


const speeds = new Map<Node, number>();
for (const node of Object.values(Node)){
	speeds.set(node, 0);
}
var count = 0;

for (let t = startDate.getTime(); t < endDate.getTime(); t += intervalMs) {
	count ++;
	
	const date = new Date(t);
	const selectedCity: CityData = {
		countryName: "ctr",
		stateName: null,
		cityName: "cty",
		latitude: 60*(Math.random()*2-1),
		longitude: Math.random()*360,
		population: 123,
		timezone: "tmz",
	};
	
	const zodiacMode = ZodiacMode.TROPICAL;
	const houseSystem = HouseSystem.PLACIDUS;
	const housePresweep = false;
	const lunarNodeMode = LunarNodeMode.MEAN; // TODO ugh, speed is prob different for true v mean
	const hamburgSchoolMode = HamburgSchoolMode.WITTE;
	const dignityMode = DignityMode.MODERN;
	
	const zodiacSignPositions = ZodiacSignPositions.create(date, zodiacMode);
	const houseCuspPositions = HouseCuspPositions.create(date, selectedCity, houseSystem, zodiacSignPositions, housePresweep)
	const nodePositions = NodePositions.create(date, selectedCity, lunarNodeMode, hamburgSchoolMode, houseCuspPositions, zodiacSignPositions, dignityMode);
	const nodeVelocities = NodeVelocities.create(nodePositions);
	
	for (const node of Object.values(Node)){
		const speed = speeds.get(node);
		speeds.set(node, speed + Math.abs(nodeVelocities.get(node)));
	}
}

for (const node of Object.values(Node)){
	const speed = speeds.get(node)/count;
	speeds.set(node, speed);
	
	const degPerDay = speed * 180 / Math.PI;
	console.log(`${node.padEnd(20)} ${degPerDay.toFixed(6)}°/day  (${count} samples)`);
}

console.log('\n--- Copyable output (radians/day) ---\n');
console.log('const averageSpeeds: Partial<Record<Node, number>> = {');
for (const [node, speed] of Array.from(speeds.entries())) {
	console.log(`\t[Node.${Object.entries(Node).find(([, v]) => v === node)?.[0]}]: ${speed},`);
}
console.log('};');



throw new Error("Alright, stopping execution.");


	
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
