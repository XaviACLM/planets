import { normalizeAngleRad, interpolateAngles } from './util.ts'

import { Node } from './astro.ts'

import { Body, GeoVector, Ecliptic, GeoMoonState, MakeTime, SiderealTime, Vector, AstroTime } from "astronomy-engine";

export interface SurfacePosition {
	latitude: number;
	longitude: number
}

export interface AxisAngles {
	asc: number;
	dsc: number;
	mc: number;
	ic: number
}

export enum HouseSystem {
	WHOLE_SIGN = "Whole Sign",
	EQUAL_HOUSES = "Equal Houses",
	PORPHYRY = "Porphyry",
	
	KRUSINSKY = "Krusinsky",
	REGIOMONTANUS = "Regiomontanus",
	
	PLACIDUS = "Placidus",
	TOPOCENTRIC = "Topocentric",
	KOCH = "Koch",
	CAMPANUS = "Campanus",
	ALCABITIUS = "Alcabitius",
}

function computeWholeSignCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	const idx = Math.floor(angles.asc/(Math.PI/6));
	return [
		normalizeAngleRad(idx*Math.PI/6),
		normalizeAngleRad((idx+1)*Math.PI/6),
		normalizeAngleRad((idx+2)*Math.PI/6),
		normalizeAngleRad((idx+3)*Math.PI/6),
		normalizeAngleRad((idx+4)*Math.PI/6),
		normalizeAngleRad((idx+5)*Math.PI/6),
		normalizeAngleRad((idx+6)*Math.PI/6),
		normalizeAngleRad((idx+7)*Math.PI/6),
		normalizeAngleRad((idx+8)*Math.PI/6),
		normalizeAngleRad((idx+9)*Math.PI/6),
		normalizeAngleRad((idx+10)*Math.PI/6),
		normalizeAngleRad((idx+11)*Math.PI/6),
	];
}

function computeEqualHousesCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	return [
		angles.asc,
		angles.asc + Math.PI/6,
		angles.asc + 2*Math.PI/6,
		angles.asc + 3*Math.PI/6,
		angles.asc + 4*Math.PI/6,
		angles.asc + 5*Math.PI/6,
		angles.asc + 6*Math.PI/6, //dsc
		angles.asc + 7*Math.PI/6,
		angles.asc + 8*Math.PI/6,
		angles.asc + 9*Math.PI/6,
		angles.asc + 10*Math.PI/6,
		angles.asc + 11*Math.PI/6,
	];
}

function computePorphyryCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	return [
		angles.asc,
		interpolateAngles(1/3, angles.asc, angles.ic),
		interpolateAngles(2/3, angles.asc, angles.ic),
		angles.ic,
		interpolateAngles(1/3, angles.ic, angles.dsc),
		interpolateAngles(2/3, angles.ic, angles.dsc),
		angles.dsc,
		interpolateAngles(1/3, angles.dsc, angles.mc),
		interpolateAngles(2/3, angles.dsc, angles.mc),
		angles.mc,
		interpolateAngles(1/3, angles.mc, angles.asc),
		interpolateAngles(2/3, angles.mc, angles.asc),
	];
}

export function computeHouseCuspPositions(date: Date, surfacePosition: SurfacePosition, houseSystem: HouseSystem, knownNodes: Map<Node, number>): number[12]{
	const angles = {
		asc: knownNodes.get(Node.ASCENDANT),
		dsc: knownNodes.get(Node.DESCENDANT),
		mc: knownNodes.get(Node.MIDHEAVEN),
		ic: knownNodes.get(Node.IMUM_COELI)
	}
	switch (houseSystem) {
		case HouseSystem.WHOLE_SIGN:
			return computeWholeSignCuspPositions(date, surfacePosition, angles);
		case HouseSystem.EQUAL_HOUSES:
			return computeEqualHousesCuspPositions(date, surfacePosition, angles);
		case HouseSystem.PORPHYRY:
			return computePorphyryCuspPositions(date, surfacePosition, angles);
		default:
			console.log("something wrong with house computation dispatch:", houseSystem);
	}
}
