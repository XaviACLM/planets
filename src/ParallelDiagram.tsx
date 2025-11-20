import { useState, useEffect, useMemo } from 'react'

import { AspectKind } from './aspects.ts'
import { Node } from './astro.ts'

import { spreadIcons, normalizeAngleDeg } from './util.ts'

import earthSymbol from "./assets/body-symbols/Earth.png"
import jupiterSymbol from "./assets/body-symbols/Jupiter.png"
import marsSymbol from "./assets/body-symbols/Mars.png"
import mercurySymbol from "./assets/body-symbols/Mercury.png"
import moonSymbol from "./assets/body-symbols/Moon.png"
import neptuneSymbol from "./assets/body-symbols/Neptune.png"
import plutoSymbol from "./assets/body-symbols/Pluto.png"
import saturnSymbol from "./assets/body-symbols/Saturn.png"
import sunSymbol from "./assets/body-symbols/Sun.png"
import uranusSymbol from "./assets/body-symbols/Uranus.png"
import venusSymbol from "./assets/body-symbols/Venus.png"
import ascendantSymbol from "./assets/body-symbols/Ascendant.png"
import descendantSymbol from "./assets/body-symbols/Descendant.png"
import midheavenSymbol from "./assets/body-symbols/Midheaven.png"
import imumCoeliSymbol from "./assets/body-symbols/Imum Coeli.png"
import lunarAscendingSymbol from "./assets/body-symbols/Lunar Ascending.png"
import lunarDescendingSymbol from "./assets/body-symbols/Lunar Descending.png"
import partOfFortuneSymbol from "./assets/body-symbols/Part of Fortune.png"
import lunarApogeeSymbol from "./assets/body-symbols/Lilith.png"
import lunarPerigeeSymbol from "./assets/body-symbols/Selene.png"

const nodeSymbolHideable: Record<Node, boolean> = {
	[Node.SUN] : false,
	[Node.MOON] : false,
	[Node.MERCURY] : false,
	[Node.VENUS] : false,
	[Node.MARS] : false,
	[Node.JUPITER] : false,
	[Node.SATURN] : false,
	[Node.URANUS] : false,
	[Node.NEPTUNE] : false,
	[Node.PLUTO] : false,
	
	[Node.ASCENDANT] : true,
	[Node.DESCENDANT] : true,
	[Node.MIDHEAVEN] : true,
	[Node.IMUM_COELI] : true,
	[Node.PART_OF_FORTUNE] : false,
	
	[Node.LUNAR_ASCENDING] : false,
	[Node.LUNAR_DESCENDING] : false,
	[Node.LUNAR_APOGEE] : false,
	[Node.LUNAR_PERIGEE] : false,
}

const nodeShortName: Record<Node, String> = {
	[Node.LUNAR_ASCENDING] : "Lunar ▲",
	[Node.LUNAR_DESCENDING] : "Lunar ▼",
	[Node.LUNAR_APOGEE] : "Lilith",
	[Node.LUNAR_PERIGEE] : "Selene",
	[Node.PART_OF_FORTUNE] : "Fortuna",
}

//TODO all this later, all this elsewhere
enum AstrologyKind {
	TROPICAL = "Tropical",
	SIDEREAL_LAHIRI = "Sidereal - Lahiri",
	SIDEREAL_FAGAN_BRADLEY = "Sidereal - Fagan / Bradley",
	SIDEREAL_RAMAN = "Sidereal - Raman",
	SIDEREAL_KRISHNAMURTI = "Sidereal - Krishnamurti",
	SIDEREAL_YUKTESHWAR = "Sidereal - Yukteshwar",
	SIDEREAL_DE_LUCE = "Sidereal - De Luce",
	SIDEREAL_HIPPARCHOS = "Sidereal - Hipparchos",
	SIDEREAL_BABYLONIAN = "Sidereal - Babylonian",
	SIDEREAL_HUBER = "Sidereal - Huber",
	SIDEREAL_SURYASIDDHANTA = "Sidereal - Suryasiddhanta",
	SIDEREAL_TRUE_CITRA = "Sidereal - True Citra",
	SIDEREAL_TRUE_REVANTI = "Sidereal - True Revanti",
}

// https://storage.yandexcloud.net/j108/library/tzubx8h2/Buz_Overbeck_-_Ayanamsa_-_A_Statistical_Study.pdf
// https://iphemeris.com/blog/document/ayanamsa
// those missing from the code in scripts, pulling swissephemeris data
const Ayanamsas: Record<AstrologyKind, number> = {
	// in J2000 ecliptic longitude
	[AstrologyKind.SIDEREAL_LAHIRI] : 23.8531,
	[AstrologyKind.SIDEREAL_FAGAN_BRADLEY] : 24.7367,
	[AstrologyKind.SIDEREAL_RAMAN] : 22.4069, 
	[AstrologyKind.SIDEREAL_KRISHNAMURTI] : 23.7619,
	[AstrologyKind.SIDEREAL_YUKTESHWAR] : 22.4778,
	[AstrologyKind.SIDEREAL_DE_LUCE] : 27.8056,
	[AstrologyKind.SIDEREAL_HIPPARCHOS] : 20.2461,
	[AstrologyKind.SIDEREAL_BABYLONIAN] : 24.7867,
	[AstrologyKind.SIDEREAL_HUBER] : 24.7336,
	[AstrologyKind.SIDEREAL_SURYASIDDHANTA] : 20.8950,
	[AstrologyKind.SIDEREAL_TRUE_CITRA] : 23.8400,
	[AstrologyKind.SIDEREAL_TRUE_REVANTI] : 20.0451,
}

// from the code in scripts, pulling simbad data
const fixedStars: Record<String, number> = {
	// in J2000 ecliptic longitude
	["Aldebaran"] : 69.785,
	["Algol"] : 56.163,
	["Sirius"] : 104.077,
	["Procyon"] : 115.781,
	["Regulus"] : 149.825,
	["Alkaid"] : 176.929,
	["Alcyone"] : 59.988,
	["Capella"] : 81.854,
	["Spica"] : 203.837,
	["Arcturus"] : 204.229,
	["Alphecca"] : 222.291,
	["Antares"] : 249.758,
	["Vega"] : 285.312,
	["Deneb Algedi"] : 323.538,
	["Unukalhai"] : 232.071,
	["Fomalhaut"] : 333.856, //not behenian, but royal
}




function ParallelDiagram({ showLabels, zodiacPositions, aspects, highlightedAspect}: {
	showLabels: boolean,
	zodiacPositions: Map<Node, number> | null,
	aspects: Aspect[] | null,
	highlightedAspect: Aspect | null
}) {
	
	
	
	
	
	
	

	const sectorRadius = 45;
	const hoveredSymbolRadius = 42;
	const symbolRadius = 40;
	const radius = 35; // percent of viewport
	const aspectRadius = showLabels ? 20 : 25;
	const planetRadius = showLabels ? 30 : (radius+aspectRadius)/2;
	
	
	const blurBaseWidth = 2;
	
	
	
	
	
	
	const strokeWidthPrimary = 0.3;
	const strokeWidthSecondary = 0.2;
	const strokeWidthTertiary = 0.1;
	const symbolSize = 6;
	const minimumIconSpace = 0.18; // radial
	const pathSegments = 30;
	const waveAmplitude = 0.5;
	
	const nodeSymbols = new Map<Node, string>([
		[Node.SUN, sunSymbol],
		[Node.MOON, moonSymbol],
		[Node.MERCURY, mercurySymbol],
		[Node.VENUS, venusSymbol],
		[Node.MARS, marsSymbol],
		[Node.JUPITER, jupiterSymbol],
		[Node.SATURN, saturnSymbol],
		[Node.URANUS, uranusSymbol],
		[Node.NEPTUNE, neptuneSymbol],
		[Node.PLUTO, plutoSymbol],
		[Node.ASCENDANT, ascendantSymbol],
		[Node.DESCENDANT, descendantSymbol],
		[Node.MIDHEAVEN, midheavenSymbol],
		[Node.IMUM_COELI, imumCoeliSymbol],
		[Node.LUNAR_ASCENDING, lunarAscendingSymbol],
		[Node.LUNAR_DESCENDING, lunarDescendingSymbol],
		[Node.LUNAR_APOGEE, lunarApogeeSymbol],
		[Node.LUNAR_PERIGEE, lunarPerigeeSymbol],
		[Node.PART_OF_FORTUNE, partOfFortuneSymbol],
	]);
	
	const { trueNodeAngles, adjustedNodeAngles } = useMemo<Map<Node, number> | null>(() => {
		const nodeAngles = zodiacPositions.getNodePositions();
		
		const adjustedPositions = spreadIcons(
			Array.from(nodeAngles.values()), minimumIconSpace
		);
		const adjustedMap = new Map<Node, number>();
		Array.from(nodeAngles.keys()).forEach((node, index) => {
			adjustedMap.set(node, adjustedPositions[index]);
		});
		
		return {
			trueNodeAngles: zodiacPositions.getNodePositions(),
			adjustedNodeAngles: adjustedMap
		};
	}, [zodiacPositions]);

	const nodes: Node[] = Array.from(adjustedNodeAngles.keys());
	//684+20
	return (
		<div style={{background: "#000", width:"342px", height: "704px"}}> 
			<svg
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid meet"
				style={{ width: "100%", height: "100%" }}
			>
				{/*
				<circle cx="50%" cy="50%" r={radius} stroke="white" strokeWidth={strokeWidthPrimary} fill="none"/>
				<circle cx="50%" cy="50%" r={radius-0.5} stroke="white" strokeWidth={strokeWidthSecondary} fill="none"/>
				
				<circle cx="50%" cy="50%" r={aspectRadius} stroke="white" strokeWidth={strokeWidthPrimary} fill="none"/>
				<circle cx="50%" cy="50%" r={aspectRadius+0.5} stroke="white" strokeWidth={strokeWidthSecondary} fill="none"/>
				
				<circle cx="50%" cy="50%" r={aspectRadius * 1/2} stroke="white" strokeWidth={strokeWidthTertiary} fill="none"/> // trines
				<circle cx="50%" cy="50%" r={aspectRadius * (Math.sqrt(2)/2)} stroke="white" strokeWidth={strokeWidthTertiary} fill="none"/> // squares
				<circle cx="50%" cy="50%" r={aspectRadius * (Math.sqrt(3)/2)} stroke="white" strokeWidth={strokeWidthTertiary} fill="none"/> // sextiles
				*/}
				
				{/*Main axis*/}
				<line
					key={-1}
					x1={50}
					y1={-50}
					x2={50}
					y2={150}
					stroke="white"
					strokeWidth={strokeWidthPrimary}
							
				/>
				
				{/*Wave*/}
				{Array.from({ length: pathSegments }).map((_, i) => {
					
					const startA = (i/pathSegments)*2*Math.PI;
					const endA = ((i+1)/pathSegments)*2*Math.PI;
					const startH = 100* startA / Math.PI - 50;
					const endH = 100 * endA / Math.PI - 50;
					
					return (
						<line
							key={i}
							x1={50 + waveAmplitude * 50 * Math.sin(startA)}
							y1={startH}
							x2={50 + waveAmplitude * 50 * Math.sin(endA)}
							y2={endH}
							stroke="white"
							strokeWidth={strokeWidthPrimary}
							
						/>
					);
				})}
				
				{/*Node symbols*/}
				{adjustedNodeAngles != null && 
					nodes.map((node, i) => {
						const a = adjustedNodeAngles.get(node);
						const left = a > Math.PI;
						const y = 100 * a / Math.PI - 50;
						const x = 50 + waveAmplitude * 50 * Math.sin(a) + (left ? -symbolSize : symbolSize);
						
						if ( showLabels && nodeSymbolHideable[node] ) {
							return null;
						}
						
						let filter: string;
						if (highlightedAspect != null && highlightedAspect.nodes.includes(node)) {
							filter = "url(#shadowAndInverted)";
						} else {
							filter = "url(#shadow)";
						}
						
						return (
							<image
								key={i}
								href={nodeSymbols.get(node)}
								x={x-symbolSize/2}
								y={y-symbolSize/2}
								width={symbolSize}
								height={symbolSize}
								filter={filter}
							/>
						);
					})
				}
				
				{/*Node true placement indicators*/}
				{trueNodeAngles != null && 
					nodes.map((node, i) => {
						const a = trueNodeAngles.get(node);
						const left = a > Math.PI;
						const y = 100 * a / Math.PI - 50;
						const x1 = 50 + waveAmplitude * 50 * Math.sin(a);
						const x2 = x1 + (left ? -1.5 : 1.5)
						
						return (
							<line
								key={i}
								x1={x1}
								y1={y}
								x2={x2}
								y2={y}
								stroke="white"
								strokeWidth={strokeWidthPrimary}
								
							/>
						);
					})
				}
				
				{/*Node labels*/}
				{adjustedNodeAngles != null && showLabels &&
					nodes.map((node, i) => {
						const a = adjustedNodeAngles.get(node);
						const left = a > Math.PI;
						const y = 100 * a / Math.PI - 50;
						const x = 50 + waveAmplitude * 50 * Math.sin(a) + (left ? -symbolSize/2 : symbolSize/2);
						
						const displacement = nodeSymbolHideable[node] ? 0 : 0.5 + symbolSize;
						
						var nodeName = node;
						if ( nodeShortName[node] ) {
							nodeName = nodeShortName[node];
						}

						return (
							<text
								key={i}
								x={left ? x-displacement : x+displacement}
								y={y+0.6}
								fontSize="3"
								fontWeight="bold"
								textAnchor={left ? "end" : "start"}
								style={{filter:"invert(1)", fontVariant: "small-caps"}}
							>
								{nodeName}
							</text>

						);
					})
				}
				
				{/*Aspects*/}
				{aspects != null &&
					aspects.map((aspect, i) => {
						
						var isParallel;
						if (aspect.kind === AspectKind.PARALLEL) {
							isParallel = true;
						} else if (aspect.kind === AspectKind.CONTRAPARALLEL) {
							isParallel = false;
						} else {
							return null;
						}
						
						const [n1, n2] = aspect.nodes;
						const a1 = trueNodeAngles.get(n1);
						const a2 = trueNodeAngles.get(n2);
						
						const y1 = 100 * a1 / Math.PI - 50;
						const y2 = 100 * a2 / Math.PI - 50;
						const x1 = 50 + waveAmplitude * 50 * Math.sin(a1);
						const x2 = 50 + waveAmplitude * 50 * Math.sin(a2);
						
						const pathData = [
							`M ${x1} ${y1}`,
							`L ${x2} ${y2}`,
							`Z`
						].join(" ");
						
						if ( aspect == highlightedAspect ) {
							return (
								<g key={`aspect-group-${i}`}>
									<path
										key={-1}
										d={pathData}
										fill="none"
										stroke="white"
										strokeWidth={blurBaseWidth}
										filter="url(#path-glow)"
										opacity={0}
										style={{ transition: 'opacity 0.6s ease' }}
										ref={node => {
											if (node) {
												requestAnimationFrame(() => {
													node.style.opacity = 1;
												});
											 }
										}}
									/>
									<path
										key={i}
										d={pathData}
										fill="none"
										stroke="white"
										strokeWidth={strokeWidthPrimary}
									/>
								</g>
							);
						} else {
							return (
								<path
									key={i}
									d={pathData}
									fill="none"
									stroke="white"
									strokeWidth={isParallel ? strokeWidthSecondary : strokeWidthTertiary}
									//strokeDasharray= {isParallel? "1,0" : "0.8px,1.6px"}
								/>
							);
						}
					})
				}
				
			</svg>
		</div>
	)
}

export default ParallelDiagram
