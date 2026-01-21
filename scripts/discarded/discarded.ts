
function swe_asc2(lst: number, lat: number, axialTilt: number){
	const z = -Math.tan(lat)*Math.sin(axialTilt) + Math.cos(axialTilt)*Math.cos(lst);
	const asc = Math.atan(Math.sin(lst)/z)
	if (asc < 180) {
		return normalizeAngleRad(180+asc);
	} else {
		return normalizeAngleRadd(asc);
	}
}

function swe_asc1(lst: number, lat: number, axialTilt: number){
	const n = Math.floor(lst/(Math.PI/2))+1;
	var asc;
	if ( n == 1 ){
		asc = swe_asc2(lst, lat, axialTilt);
	} else if ( n == 2 ) {
		asc = Math.PI - swe_asc2(Math.PI - lst, -lat, axialTilt);
	} else if ( n == 3 ) {
		asc = Math.PI + swe_asc2(lst - Math.PI, -lat, axialTilt);
	} else {
		asc = 2*Math.PI - swe_asc2(2*Math.PI - lst, lat, axialTilt);
	}
	return normalizeAngleRad(asc);
	
}

function computeTopocentricCuspPositions3(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	
	const axialTilt = computeAxialTilt(date);	
	const { asc, mc, dsc, ic } = angles;
	
	const { RA: RAMC, declination: declinationMC } = eclipticLongitudeToRAAndDeclination(mc, axialTilt);
	const latTan = Math.tan(surfacePosition.latitude*Math.PI/180);
	const fh1 = Math.atan(latTan/3);
	const fh2 = Math.atan(latTan*2/3);
	
	const th = declinationMC;//surfacePosition.latitude * Math.PI/360;
	
	const cusp11 = swe_asc1(th + Math.PI/6, fh1, axialTilt)
	const cusp12 = swe_asc1(th + Math.PI/3, fh2, axialTilt)
	const cusp2 = swe_asc1(th + Math.PI*2/3, fh2, axialTilt)
	const cusp3 = swe_asc1(th + Math.PI*5/6, fh1, axialTilt)
	
	return [
		asc,
		cusp2,
		cusp3,
		ic,
		normalizeAngleRad(Math.PI+cusp11),
		normalizeAngleRad(Math.PI+cusp12),
		dsc,
		normalizeAngleRad(Math.PI+cusp2),
		normalizeAngleRad(Math.PI+cusp3),
		mc,
		cusp11,
		cusp12
	]
}




function computePolichPageCusp2(tan: number, start: number, end: number, axialTilt: number): number {
	const cuspDecl = Math.atan(tan);
	console.log("prev",cuspDecl,Math.sin(cuspDecl)/Math.sin(axialTilt));
	const cuspLongOpt1 = Math.asin(Math.sin(cuspDecl)/Math.sin(axialTilt));
	const cuspLongOpt2 = (cuspLongOpt1 > 0 ? Math.PI : -Math.PI) - cuspLongOpt1;
	console.log(cuspLongOpt1, cuspLongOpt2);
	if ( anglesLieInShortArc(start, cuspLongOpt1, end) ) {
		return cuspLongOpt1;
	} else {
		return cuspLongOpt2;
	}
}

function computeTopocentricCuspPositions2(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	
	const axialTilt = computeAxialTilt(date);	
	const { asc, mc, dsc, ic } = angles;
	
	const latTan = Math.tan(surfacePosition.latitude*Math.PI/180);
	
	//const { RA: RAMC, declination: declinationMC } = eclipticLongitudeToRAAndDeclination(mc, axialTilt);
	
	return [
		asc,
		computePolichPageCusp2(-latTan/3, asc, ic, axialTilt),
		computePolichPageCusp2(-latTan*2/3, asc, ic, axialTilt),
		ic,
		computePolichPageCusp2(-latTan*2/3, ic, dsc, axialTilt),
		computePolichPageCusp2(-latTan/3, ic, dsc, axialTilt),
		dsc,
		computePolichPageCusp2(latTan/3, dsc, mc, axialTilt),
		computePolichPageCusp2(latTan*2/3, dsc, mc, axialTilt),
		mc,
		computePolichPageCusp2(latTan*2/3, mc, asc, axialTilt),
		computePolichPageCusp2(latTan/3, mc, asc, axialTilt)
	]
}







// from before we decided to do away with the trig approaches
function computeMCIC(date: Date, surfacePos: SurfacePosition): Map<Node, number> {
	const longitudeDeg = surfacePos.longitude;
	const gstHours = SiderealTime(date);
	const lstHours = gstHours + longitudeDeg / 15.0;
	const lstHoursNorm = ((lstHours % 24) + 24) % 24;
	const theta = lstHoursNorm * Math.PI / 12
	
	const epsRad = computeAxialTilt(date);
	
	//const mc = Math.atan2(Math.cos(epsRad)*Math.sin(theta), Math.cos(theta));
	// TODO what the hell is going on here?
	const mc = Math.atan2(Math.sin(theta)/Math.cos(epsRad), Math.cos(theta));
	
	return new Map<Node, number>([
		[Node.MIDHEAVEN, normalizeAngleRad(mc)],
		[Node.IMUM_COELI, normalizeAngleRad(mc + Math.PI)]
	]);
}