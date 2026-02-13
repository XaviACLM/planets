	/*
	TODO remove this from here when we make that hook stuff
	
	dependencies. Starred if they have one or more change methods associated, = should NOT always cause full recompute
	change methods only listed if nontrivial. Assume star implies unary change method
	
	fixedStarPositions
		date
	
	zodiacSignPositions
		date
		zodiacMode
		
	houseCuspPositions
		date
		surfacePosition
		houseSystem
		*zodiacSignPositions
		*housePresweep
	
	nodePositions
		date
		surfacePosition
		*lunarNodeMode
		*hamburgSchoolMode
		*houseCuspPositions
		*zodiacSignPositions (no unary method)
		*dignityMode
		
		.changeZodiacSignPositionsAndHouseCuspPositions
		
	nodeVelocities
		*basePositions: NodePositions
		timeDeltaMs (optional)
		
		.changeBasePositionsWithLunarNodeMode
		.changeBasePositionsWithHamburgSchoolMode
		.changeBasePositionsWithHouseCuspPositions
		.changeBasePositionsWithZodiacSignPositionsAndHouseCuspPositions
		.changeBasePositionsWithDignityMode

		(notice how these are all stars of nodePositions. full recompute forces full recompute, though)
	
	this one can just be a useMemo, since nobody depends on it nontrivially and it has no nontrivial dependencies:
	
	rulershipGraph
		nodePositions
		zodiacSignPositions
		dignityMode
		
	turning this list into a satisfying bunch of update logic is actually pretty... eh, I don't know. We can wing it but it feels very winged
	anyway we need to make ssure that changes to dignity mode go -> np -> nv (X)
	analogously for changes to hcp and zsp. But how? we need to make sure we cover every situation where hcp and zsp change
	full recompute: yes, if date or surfacePosition changes then we account for that. (X)
	Apart from this.
	hcp:
		from houseSystem change: so put it in the useEffect (X)
		from zsp change: ? well, these are either
			from date: full recompute scenario, accounted for
			from zodiacMode change: accounted for below
		from housePresweep change: no effect, no need to do anything
	zsp:
		from zodiacMode change: put it in the useEffect (X)
		
	I got pretty close to an actual exploration algorithm there. Interesting. I wonder if there's something worthwhile here.
	
	TODO account for possible nullity. You dumbass. You didn't do it. Dumbass.
	*/
import { useState, useEffect, useMemo } from 'react'

import NodePositions from './nodePositions.ts'
import NodeVelocities from './nodeVelocities.ts'
import ZodiacSignPositions from './zodiacSignPositions.ts'
import FixedStarPositions from './fixedStarPositions.ts'
import HouseCuspPositions from './houseCuspPositions.ts'
import { RulershipGraph } from './rulershipGraph.ts'

import { HouseSystem, ZodiacMode, LunarNodeMode, HamburgSchoolMode, DignityMode } from './settingsDefs.ts'

import { Node } from './astroDefs.ts'
import { toZonedTime, fromZonedTime, toISOLocal } from './util.ts'
import { findAspects, type Aspect, filterAspects, formatAspects, flattenSubaspectsToList, deleteAspectFromMap } from './aspects.ts'

import { useSettingsStore } from './settingsStore.ts'


export function useEventChartPositions(
	selectedCity: CityData,
	selectedDate: Date,
	zodiacMode: ZodiacMode,
	houseSystem: HouseSystem,
	housePresweep: boolean,
	lunarNodeMode: LunarNodeMode,
	hamburgSchoolMode: HamburgSchoolMode,
	dignityMode: DignityMode,
) {
	const [fixedStarPositions, setFixedStarPositions] = useState<FixedStarPositions>(() => FixedStarPositions.create(selectedDate));
	const [zodiacSignPositions, setZodiacSignPositions] = useState<ZodiacSignPositions>(() => ZodiacSignPositions.create(selectedDate, zodiacMode));
	const [houseCuspPositions, setHouseCuspPositions] = useState<HouseCuspPositions | null>(() =>
		selectedCity !== null
			? HouseCuspPositions.create(selectedDate, selectedCity, houseSystem, zodiacSignPositions, housePresweep)
			: null
	);
	const [nodePositions, setNodePositions] = useState<NodePositions>(() => NodePositions.create(selectedDate, selectedCity, lunarNodeMode, hamburgSchoolMode, houseCuspPositions, zodiacSignPositions, dignityMode));
	const [nodeVelocities, setNodeVelocities] = useState<NodeVelocities>(() => NodeVelocities.create(nodePositions));
	const [houseSystemComputationFailed, setHouseSystemComputationFailed] = useState<boolean>(selectedCity !== null && houseCuspPositions === null);


	// Full recompute on date/city change
	useEffect(() => {
		setFixedStarPositions(FixedStarPositions.create(selectedDate));
		const newZSP = ZodiacSignPositions.create(selectedDate, zodiacMode);
		setZodiacSignPositions(newZSP);
		const newHCP = selectedCity !== null
			? HouseCuspPositions.create(selectedDate, selectedCity, houseSystem, newZSP, housePresweep)
			: null;
		setHouseCuspPositions(newHCP);
		const newNP = NodePositions.create(selectedDate, selectedCity, lunarNodeMode, hamburgSchoolMode, newHCP, newZSP, dignityMode);
		setNodePositions(newNP);
		setNodeVelocities(NodeVelocities.create(newNP));
		setHouseSystemComputationFailed(selectedCity !== null && newHCP === null && houseSystem !== HouseSystem.NO_HOUSES);
	}, [selectedCity, selectedDate])

	// Partial recompute effects
	useEffect(() => {
		const newNP = nodePositions.changeLunarNodeMode(lunarNodeMode);
		setNodePositions(newNP);
		setNodeVelocities(nodeVelocities.changeBasePositionsWithLunarNodeMode(newNP, lunarNodeMode));
	}, [lunarNodeMode])

	useEffect(() => {
		const newNP = nodePositions.changeHamburgSchoolMode(hamburgSchoolMode);
		setNodePositions(newNP);
		setNodeVelocities(nodeVelocities.changeBasePositionsWithHamburgSchoolMode(newNP, hamburgSchoolMode));
	}, [hamburgSchoolMode])

	useEffect(() => {
		const newZSP = ZodiacSignPositions.create(selectedDate, zodiacMode);
		setZodiacSignPositions(newZSP);
		const newHCP = houseCuspPositions?.changeZodiacSignPositions(newZSP) ?? null;
		setHouseCuspPositions(newHCP);
		setHouseSystemComputationFailed(selectedCity !== null && newHCP === null && houseSystem !== HouseSystem.NO_HOUSES);
		const newNP = nodePositions.changeZodiacSignPositionsAndHouseCuspPositions(newZSP, newHCP);
		setNodePositions(newNP);
		const newNV = nodeVelocities.changeBasePositionsWithZodiacSignPositionsAndHouseCuspPositions(newNP, newZSP, newHCP);
		setNodeVelocities(newNV);
	}, [zodiacMode])

	useEffect(() => {
		const newHCP = selectedCity !== null
			? HouseCuspPositions.create(selectedDate, selectedCity, houseSystem, zodiacSignPositions, housePresweep)
			: null;
		setHouseCuspPositions(newHCP);
		setHouseSystemComputationFailed(selectedCity !== null && newHCP === null && houseSystem !== HouseSystem.NO_HOUSES);
		const newNP = nodePositions.changeHouseCuspPositions(newHCP);
		setNodePositions(newNP);
		const newNV = nodeVelocities.changeBasePositionsWithHouseCuspPositions(newNP, newHCP);
		setNodeVelocities(newNV);
	}, [houseSystem])

	useEffect(() => {
		const newHCP = houseCuspPositions?.changeHousePresweep(housePresweep) ?? null;
		setHouseCuspPositions(newHCP);
		setHouseSystemComputationFailed(selectedCity !== null && newHCP === null && houseSystem !== HouseSystem.NO_HOUSES);
	}, [housePresweep])

	useEffect(() => {
		const newNP = nodePositions.changeDignityMode(dignityMode);
		setNodePositions(newNP);
		const newNV = nodeVelocities.changeBasePositionsWithDignityMode(newNP, dignityMode);
		setNodeVelocities(newNV);
	}, [dignityMode])
	
	return {
		fixedStarPositions,
		zodiacSignPositions,
		houseCuspPositions,
		nodePositions,
		nodeVelocities,
		houseSystemComputationFailed,
	}
}