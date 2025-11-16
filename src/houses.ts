import { normalizeAngleRad } from './util.ts'

import { Body, GeoVector, Ecliptic, GeoMoonState, MakeTime, SiderealTime, Vector, AstroTime } from "astronomy-engine";

export interface SurfacePosition {
	latitude: number;
	longitude: number
}

export enum HouseSystem {
	WHOLE_SIGN = "Whole Sign",
	EQUAL_HOUSES = "Equal Houses",
	PORPHYRY = "Porphyry"
	
	KRUSINSKY = "Krusinsky"
	REGIOMONTANUS = "Regiomontanus"
	
	PLACIDUS = "Placidus"
	TOPOCENTRIC = "Topocentric"
	KOCH = "Koch"
	CAMPANUS = "Campanus"
	ALCABITIUS = "Alcabitius"
}

function computeHouseCuspPositions(date: Date, surfacePos: SurfacePosition, houseSystem: HouseSystem): Map<Node, number>{
	//TODO
}
