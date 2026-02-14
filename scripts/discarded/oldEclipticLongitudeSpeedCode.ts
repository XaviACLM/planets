import { StateVector, Vector, Body, GeoVector, Ecliptic, GeoMoonState, MakeTime, HelioState, AstroTime, Rotation_ECL_EQJ, Rotation_EQJ_ECT, RotateState, RotateVector } from 'astronomy-engine';
import { HamburgSchoolMode } from './settingsDefs.ts';

// Convert geocentric EQJ state to geocentric ECT (for Moon which is already geocentric)
function geocentricEQJToECT(state: StateVector, date: Date): SimpleState {
	const rotation = Rotation_EQJ_ECT(date);
	const geocentricECT = RotateState(rotation, state);
	return {
		x: geocentricECT.x, y: geocentricECT.y, z: geocentricECT.z,
		vx: geocentricECT.vx, vy: geocentricECT.vy, vz: geocentricECT.vz
	};
}

// Extract ecliptic longitude speed (radians/day) from state
// Formula: d/dt(atan2(y, x)) = (x*vy - y*vx) / (x² + y²)
function eclipticLongitudeSpeedFromState(state: SimpleState): number {
	const { x, y, vx, vy } = state;
	return (x * vy - y * vx) / (x * x + y * y);
}

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
	const body = nodeToBody[node]!;

	const planetState = HelioState(body, date);
	const stateEQJ: SimpleState = {
		x: planetState.x, y: planetState.y, z: planetState.z,
		vx: planetState.vx, vy: planetState.vy, vz: planetState.vz
	};
	const geocentricECT = heliocentricEQJToGeocentricECT(stateEQJ, date);
	return eclipticLongitudeSpeedFromState(geocentricECT);
}