import { StateVector, Vector, Body, GeoVector, Ecliptic, GeoMoonState, HelioState, AstroTime, Rotation_ECL_EQJ, Rotation_EQJ_ECT, RotateState, RotateVector } from 'astronomy-engine';

import { classicalRulerships, modernRulerships, Node } from './astroDefs.ts';
import { DignityMode, HamburgSchoolMode } from './settingsDefs.ts';
import { stateFromKepler, type OrbitalState, positionFromKepler, type OrbitParams } from './astroFromOrbitalParams.ts';
import ZodiacPositions from './zodiacPositions';

// not astronomy, but this will move to a new rulerships.ts file soon
export function getChartRuler(zodiacPositions: ZodiacPositions, dignityMode: DignityMode): Node | null {
	if (!zodiacPositions.hasSurfacePosition()) {
		return null;
	}
	const ascendantSign = zodiacPositions.getSymbolOfNode(Node.ASCENDANT) as unknown as Zodiac;
	const rulerships = dignityMode === DignityMode.CLASSICAL ? classicalRulerships : modernRulerships;
	return rulerships[ascendantSign];
}

export function getEclipticLongitudeSpeed(node: Node, date: Date, hamburgSchoolMode: HamburgSchoolMode): number | null {
	// Moon is a special case - GeoMoonState gives us geocentric EQJ directly
	if (node === Node.MOON) {
		const moonState = GeoMoonState(date);
		const geocentricECT = geocentricEQJToECT(moonState, date);
		return eclipticLongitudeSpeedFromState(geocentricECT);
	}

	// Check if this is a small body (asteroids, dwarf planets, etc.)
	const smallBodyParam = smallBodyParams[node];
	if (smallBodyParam) {
		const stateECJ = stateFromKepler(smallBodyParam, date);
		const stateEQJ = heliocentricECJToEQJ(stateECJ, date);
		const geocentricECT = heliocentricEQJToGeocentricECT(stateEQJ, date);
		return eclipticLongitudeSpeedFromState(geocentricECT);
	}

	// Check if this is a Hamburg school object
	const hamburgSchoolParams = hamburgSchoolMode === HamburgSchoolMode.NEELY ? hamburgSchoolParamsNeely : hamburgSchoolParamsWitte;
	const hamburgParam = hamburgSchoolParams[node];
	if (hamburgParam) {
		const stateECJ = stateFromKepler(hamburgParam, date);
		const stateEQJ = heliocentricECJToEQJ(stateECJ, date);
		const geocentricECT = heliocentricEQJToGeocentricECT(stateEQJ, date);
		return eclipticLongitudeSpeedFromState(geocentricECT);
	}

	// For standard planets, use HelioState (already in EQJ)
	const body = nodeToBody[node];
	if (!body) {
		return null;
	}

	const planetState = HelioState(body, date);
	const stateEQJ: SimpleState = {
		x: planetState.x, y: planetState.y, z: planetState.z,
		vx: planetState.vx, vy: planetState.vy, vz: planetState.vz
	};
	const geocentricECT = heliocentricEQJToGeocentricECT(stateEQJ, date);
	return eclipticLongitudeSpeedFromState(geocentricECT);
}

export function orbitalParamsToGeocentricLongitude(params: OrbitParams, date: Date): number {
	// Get heliocentric ECL J2000 position
	const posECJ = positionFromKepler(params, date);
	// Convert to EQJ (just position, use zero velocity)
	const stateEQJ = heliocentricECJToEQJ({ ...posECJ, vx: 0, vy: 0, vz: 0 }, date);
	const stateECT = heliocentricEQJToGeocentricECT(stateEQJ, date);
	return eclipticLongitudeFromPosition(stateECT);
}

export function bodyToGeocentricLongitude(body: Body, date: Date) {
	const correctForAberration = true;
		
	//returns geocentric EQJ2000 vector. also stores date
	const eqj = GeoVector(body, date, correctForAberration)
	
	// accepts EQJ2000 vector w date and turns into ECT (ecliptic of date)
	const etc = Ecliptic(eqj);
		
	return etc.elon/180*Math.PI;
}

// our nodes -> astronomy engine bodies
export const nodeToBody: Partial<Record<Node, Body>> = {
	[Node.SUN]: Body.Sun,
	[Node.MOON]: Body.Moon,
	[Node.MERCURY]: Body.Mercury,
	[Node.VENUS]: Body.Venus,
	[Node.MARS]: Body.Mars,
	[Node.JUPITER]: Body.Jupiter,
	[Node.SATURN]: Body.Saturn,
	[Node.URANUS]: Body.Uranus,
	[Node.NEPTUNE]: Body.Neptune,
	[Node.PLUTO]: Body.Pluto,
};

// ============================================================================
// Coordinate conversion helpers
// ============================================================================

type SimpleState = { x: number; y: number; z: number; vx: number; vy: number; vz: number };

// Convert heliocentric ecliptic J2000 state to heliocentric equatorial J2000
function heliocentricECJToEQJ(state: OrbitalState, date: Date): SimpleState {
	const rotation = Rotation_ECL_EQJ();
	const posVec = new Vector(state.x, state.y, state.z, new AstroTime(date));
	const velVec = new Vector(state.vx, state.vy, state.vz, new AstroTime(date));
	const posEQJ = RotateVector(rotation, posVec);
	const velEQJ = RotateVector(rotation, velVec);
	return { x: posEQJ.x, y: posEQJ.y, z: posEQJ.z, vx: velEQJ.x, vy: velEQJ.y, vz: velEQJ.z };
}

// Convert heliocentric EQJ state to geocentric ECT (ecliptic of today)
function heliocentricEQJToGeocentricECT(state: SimpleState, date: Date): SimpleState {
	// Get Earth's heliocentric state
	const earthState = HelioState(Body.Earth, date);

	// Geocentric = body - Earth
	const geocentricEQJ = new StateVector(
		state.x - earthState.x,
		state.y - earthState.y,
		state.z - earthState.z,
		state.vx - earthState.vx,
		state.vy - earthState.vy,
		state.vz - earthState.vz,
		new AstroTime(date)
	);

	// Rotate to ecliptic of today
	const rotation = Rotation_EQJ_ECT(date);
	const geocentricECT = RotateState(rotation, geocentricEQJ);

	return {
		x: geocentricECT.x, y: geocentricECT.y, z: geocentricECT.z,
		vx: geocentricECT.vx, vy: geocentricECT.vy, vz: geocentricECT.vz
	};
}

// Convert geocentric EQJ state to geocentric ECT (for Moon which is already geocentric)
function geocentricEQJToECT(state: StateVector, date: Date): SimpleState {
	const rotation = Rotation_EQJ_ECT(date);
	const geocentricECT = RotateState(rotation, state);
	return {
		x: geocentricECT.x, y: geocentricECT.y, z: geocentricECT.z,
		vx: geocentricECT.vx, vy: geocentricECT.vy, vz: geocentricECT.vz
	};
}

// Extract ecliptic longitude (radians) from position
export function eclipticLongitudeFromPosition(pos: { x: number; y: number }): number {
	let lon = Math.atan2(pos.y, pos.x);
	if (lon < 0) lon += 2 * Math.PI;
	return lon;
}

// Extract ecliptic longitude speed (radians/day) from state
// Formula: d/dt(atan2(y, x)) = (x*vy - y*vx) / (x² + y²)
function eclipticLongitudeSpeedFromState(state: SimpleState): number {
	const { x, y, vx, vy } = state;
	return (x * vy - y * vx) / (x * x + y * y);
}
