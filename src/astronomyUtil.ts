import { StateVector, Vector, Body, GeoVector, Ecliptic, GeoMoonState, MakeTime, HelioState, AstroTime, Rotation_ECL_EQJ, Rotation_EQJ_ECT, RotateState, RotateVector } from 'astronomy-engine';

import { normalizeAngleRad } from './util.ts'
import { Node } from './astroDefs.ts';
import { HamburgSchoolMode } from './settingsDefs.ts';
import { stateFromKepler, type OrbitalState, positionFromKepler, type OrbitParams, smallBodyParams, hamburgSchoolParamsNeely, hamburgSchoolParamsWitte } from './astroFromOrbitalParams.ts';
import { type vec3, toAstronomyVector } from './geometry.ts';

export function getEclipticLongitudeSpeed(node: Node, date: Date, hamburgSchoolMode: HamburgSchoolMode): number {
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
		
	return normalizeAngleRad(etc.elon/180*Math.PI);
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
	const lon = Math.atan2(pos.y, pos.x);
	return normalizeAngleRad(lon);
}

// Extract ecliptic longitude speed (radians/day) from state
// Formula: d/dt(atan2(y, x)) = (x*vy - y*vx) / (x² + y²)
function eclipticLongitudeSpeedFromState(state: SimpleState): number {
	const { x, y, vx, vy } = state;
	return (x * vy - y * vx) / (x * x + y * y);
}

// takes and returns radians
// goes J2000 -> date
export function addPrecession(date: Date, longitude: number): number {
	const radPerSecondPrecession = 4.426734852389845e-10 * Math.PI/180;
	const j2000InMillis = Date.UTC(2000, 0, 1, 12, 0, 0);

	//getTime will count leap seconds, but the difference is negligible
	const delta = (date.getTime() - j2000InMillis) / 1000;
	return normalizeAngleRad(longitude + radPerSecondPrecession * delta);
}

export function getTodayEclipticLongitudeFromEQJ(date: Date, v: vec3): number {
	const astroTime = new AstroTime(date);
	const vECT = RotateVector(Rotation_EQJ_ECT(astroTime), toAstronomyVector(v));
	return Math.atan2(vECT.y, vECT.x);
}

export function computeLunarApogeePerigeeMeeus(date: Date): Map<Node, number> {
	const jd = (date.getTime() / 86400000) + 2440587.5;
	const t = (jd - 2451545.0) / 36525.0;

	// again Meeus Ch. 47
	const omega = 83.3532465 + 4069.0137287 * t - 0.0103200 * t*t - (t*t*t)/80053;
	const perigee = (omega % 360) * Math.PI / 180;

	return new Map<Node, number>([
		[Node.LUNAR_PERIGEE, normalizeAngleRad(perigee)],
		[Node.LUNAR_APOGEE, normalizeAngleRad(perigee + Math.PI)]
	]);
}

export function computeLunarApogeePerigeeExact(date: Date): Map<Node, number> {
	const s = GeoMoonState(date);

	const GM = 8.887692587023177e-10;  // earth's gravitational parameter in AU^3 / day^2
	const r = Math.sqrt(s.x*s.x + s.y*s.y + s.z*s.z);

	// angular momentum
	const h = {
		x: s.y * s.vz - s.z * s.vy,
		y: s.z * s.vx - s.x * s.vz,
		z: s.x * s.vy - s.y * s.vx
	};

	// eccentricity vector points toward perigee
	const rVec = {x: s.x, y: s.y, z: s.z};
	const vVec = {x: s.vx, y: s.vy, z: s.vz};

	// e = (v x h)/GM - r/mod(r)
	const vxh = {
		x: vVec.y * h.z - vVec.z * h.y,
		y: vVec.z * h.x - vVec.x * h.z,
		z: vVec.x * h.y - vVec.y * h.x
	};
	const e = {
		x: vxh.x/GM - rVec.x/r,
		y: vxh.y/GM - rVec.y/r,
		z: vxh.z/GM - rVec.z/r,
		t: MakeTime(date)
	};


	const eEcl = Ecliptic(new Vector(e.x, e.y, e.z, e.t)).vec;
	const omega = Math.atan2(eEcl.y, eEcl.x);

	return new Map<Node, number>([
		[Node.LUNAR_PERIGEE, normalizeAngleRad(omega)],
		[Node.LUNAR_APOGEE, normalizeAngleRad(omega + Math.PI)]
	]);
}

export function computeLunarNodesMeeus(date: Date): Map<Node, number> {
	const jd = (date.getTime() / 86400000) + 2440587.5; // Unix ms -> JD
	const t = (jd - 2451545.0) / 36525.0;

	// Meeus Ch. 47: mean longitude of ascending node of lunar orbit
	const omega = 125.04452 - 1934.136261 * t + 0.0020708 * t*t + (t*t*t)/450000; // small correction

	const ascending = (omega)/360*2*Math.PI;

	return new Map <Node, number>([
		[Node.LUNAR_ASCENDING, normalizeAngleRad(ascending)],
		[Node.LUNAR_DESCENDING, normalizeAngleRad(ascending + Math.PI)]
	]);
}

export function computeLunarNodesExact(date: Date): Map<Node, number>{

	const s = GeoMoonState(date);

	const r = { x: s.x, y: s.y, z: s.z };
	const v = { x: s.vx, y: s.vy, z: s.vz };
	const h = {
		x: r.y * v.z - r.z * v.y,
		y: r.z * v.x - r.x * v.z,
		z: r.x * v.y - r.y * v.x,
		t: new AstroTime(date)
	};

	const hEcl = Ecliptic(new Vector(h.x, h.y, h.z, h.t)).vec; // { x, y, z } in ecliptic frame
	const omega = Math.atan2(hEcl.x, -hEcl.y);
	return new Map <Node, number>([
		[Node.LUNAR_ASCENDING, normalizeAngleRad(omega)],
		[Node.LUNAR_DESCENDING, normalizeAngleRad(omega + Math.PI)]
	]);
}
