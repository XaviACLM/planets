import { useState, useEffect, useMemo } from 'react'

import { AspectKind } from './aspects.ts'
import { Node, Zodiac } from './astroDefs.ts'

import { spreadIcons, normalizeAngleDeg } from './util.ts'

import { nodeSymbolHideable, zodiacSymbols, nodeSymbols, earthSymbol, nodeShortName } from './astroGraphics.ts'

function ZodiacWheel({ showLabels, flipText, housePresweep, rotateSymbols, zodiacPositions, selectedNodes, aspects, highlightedAspect}: {
	showLabels: boolean,
	flipText: boolean,
	housePresweep: boolean,
	rotateSymbols: boolean,
	zodiacPositions: Map<Node, number> | null,
	selectedNodes: Set<Node>,
	aspects: Aspect[] | null,
	highlightedAspect: Aspect | null
}) {
	
	const sectorRadius = 45;
	const symbolRadius = 40;
	const radius = 35; // percent of viewport
	const aspectRadius = showLabels ? 20 : 25;
	const planetRadius = showLabels ? 30 : (radius+aspectRadius)/2;
	
	const minimumIconSpace = 0.12; // radial
	
	const symbolSize = 4;
	const strokeWidthPrimary = 0.15;
	const strokeWidthSecondary = 0.1;
	const strokeWidthTertiary = 0.05;
	const blurBaseWidth = 2;
	
	const { offset, nodeAngles, houseCuspAngles, siderealOffset } = useMemo<Map<Node, number> | null>(() => {
		
		const offset = zodiacPositions.hasSurfacePosition() ?
			Math.PI - zodiacPositions.getNodePosition(Node.ASCENDANT)
			: -Math.PI/12;
		
		// this is vestigial, but it will be useful in the future to implement anglo style
		const nodeAngles = new Map<Node, number>();
		zodiacPositions.getNodePositions().forEach((position, node) => { // what?
			if (selectedNodes.has(node)) {
				nodeAngles.set(node, position + offset);
			}
		})
		
		return {
			offset: offset,
			nodeAngles: nodeAngles,
			houseCuspAngles: zodiacPositions.getHouseCuspPositions(),
			siderealOffset: zodiacPositions.siderealOffset,
		}
	}, [zodiacPositions, selectedNodes]);
	
	const adjustedNodeAngles = useMemo(() => {
		if ( nodeAngles === null ) return null;
		
		const adjustedPositions = spreadIcons(
			Array.from(nodeAngles.values()), minimumIconSpace
		);
		
		const adjustedMap = new Map<Node, number>();
		Array.from(nodeAngles.keys()).forEach((node, index) => {
			adjustedMap.set(node, adjustedPositions[index]);
		});
		return adjustedMap;
	}, [nodeAngles]);

	const zodiac: Zodiac[] = Array.from(zodiacSymbols.keys());
	const nodes: Zodiac[] = Array.from(nodeAngles.keys());
	
	const [hoveredZodiac, setHoveredZodiac] = useState<number | null>(null);
	
	return (
		<div style={{background: "#000", width:"100vw", height: "100vh"}}>
			<svg
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid meet"
				style={{ width: "100%", height: "100%" }}
			>
				<circle cx="50%" cy="50%" r={radius} stroke="white" strokeWidth={strokeWidthPrimary} fill="none"/>
				<circle cx="50%" cy="50%" r={radius-0.5} stroke="white" strokeWidth={strokeWidthSecondary} fill="none"/>
				
				<circle cx="50%" cy="50%" r={aspectRadius} stroke="white" strokeWidth={strokeWidthPrimary} fill="none"/>
				<circle cx="50%" cy="50%" r={aspectRadius+0.5} stroke="white" strokeWidth={strokeWidthSecondary} fill="none"/>
				
				<circle cx="50%" cy="50%" r={aspectRadius * 1/2} stroke="white" strokeWidth={strokeWidthTertiary} fill="none"/> // trines
				<circle cx="50%" cy="50%" r={aspectRadius * (Math.sqrt(2)/2)} stroke="white" strokeWidth={strokeWidthTertiary} fill="none"/> // squares
				<circle cx="50%" cy="50%" r={aspectRadius * (Math.sqrt(3)/2)} stroke="white" strokeWidth={strokeWidthTertiary} fill="none"/> // sextiles

				<image
					key={-1}
					href={earthSymbol}
					x={50-symbolSize/2}
					y={50-symbolSize/2}
					width={symbolSize}
					height={symbolSize}
					style={{filter:"invert(1)"}}
				/>
				
				{/*Outer zodiac sector separators*/}
				{Array.from({ length: 12 }).map((_, i) => {
					const a = (i/12) * 2 * Math.PI + offset + siderealOffset;
					return (
						<line
							key={i}
							x1={50 + radius * Math.cos(a)}
							y1={50 - radius * Math.sin(a)}
							x2={50 + sectorRadius * Math.cos(a)}
							y2={50 - sectorRadius * Math.sin(a)}
							stroke="white"
							strokeWidth={strokeWidthPrimary}
							
						/>
					);
				})}
				
				{/*House separators*/}
				{Array.from({ length: 12 }).map((_, i) => {
					let a;
					if (houseCuspAngles) {
						if (housePresweep) { a = houseCuspAngles[i] + offset - Math.PI/36 // 5 degree presweep
						} else { a = houseCuspAngles[i] + offset; }
					} else { a = (i/12) * 2 * Math.PI - offset; }
					return (
						<line
							key={i}
							x1={50 + (radius - 3) * Math.cos(a)}
							y1={50 - (radius - 3) * Math.sin(a)}
							x2={50 + (aspectRadius + 3) * Math.cos(a)}
							y2={50 - (aspectRadius + 3) * Math.sin(a)}
							stroke="white"
							strokeWidth={strokeWidthTertiary}
							
						/>
					);
				})}
				
				{/*House presweep line*/}
				{ housePresweep && zodiacPositions.hasSurfacePosition() &&
					Array.from({ length: 12 }).map((_, i) => {
						const a = houseCuspAngles[i] + offset;
						return (
							<line
								key={i}
								x1={50 + (aspectRadius + 3) * Math.cos(a)}
								y1={50 - (aspectRadius + 3) * Math.sin(a)}
								x2={50 + (radius - 3) * Math.cos(a)}
								y2={50 - (radius - 3) * Math.sin(a)}
								stroke="white"
								strokeWidth={strokeWidthTertiary}
								strokeDasharray="0.2,0.5"
							/>
						);
					})
				}
				
				{/*House cusp labels*/}
				{zodiacPositions.hasSurfacePosition() &&
					Array.from({ length: 12 }).map((_, i) => {
						const a = houseCuspAngles[i] + offset;
						const r = normalizeAngleDeg(-(a * 180) / Math.PI + 180);
						const flip = (r>90 && r<270) && flipText;
						const adj = flip ? 0.01 : -0.01; //perfect alignment w/ house separators
						const x = 50 + (radius-1) * Math.cos(a+adj);
						const y = 50 - (radius-1) * Math.sin(a+adj);
						const cuspName = "H"+String(i+1)
						return (
							<text
								key={i}
								x={x}
								y={y+0.6}
								width={symbolSize}
								height={symbolSize}
								fontSize="1"
								fontWeight="bold"
								textAnchor={flip ? "end" : "start"}
								transform={flip ? `rotate(${r+180}, ${x}, ${y})` : `rotate(${r}, ${x}, ${y})`}
								style={{filter:"invert(1)", fontVariant: "small-caps"}}
							>
								{cuspName}
							</text>
						);
					})
				}
				
				{/*Zodiac symbols*/}
				{zodiac.map((symbol, i) => {
					const a = (i/12) * 2 * Math.PI + offset + Math.PI/12 + siderealOffset;
					const x = 50 + symbolRadius * Math.cos(a);
					const y = 50 - symbolRadius * Math.sin(a);
					const r = rotateSymbols ? -(a * 180) / Math.PI + 90 : 0;
					const translateY = hoveredZodiac === i ? -2 : 0;
					return (
						<image
							key={i}
							href={zodiacSymbols.get(symbol)}
							x={x-symbolSize/2}
							y={y-symbolSize/2}
							width={symbolSize}
							height={symbolSize}
							style={{
								transition: "transform 0.5s ease",
								filter:"invert(1)",
								transform: `rotate(${r}deg) translateY(${translateY}px)`,
								transformOrigin: `${x}px ${y}px`
							}}
						/>
					);
				})}
				
				{/*Zodiac labels*/}
				{showLabels && 
					zodiac.map((symbol, i) => {
						const a = ((i+1)/12) * 2 * Math.PI - 0.01 + offset + siderealOffset;
						const x = 50 + sectorRadius * Math.cos(a);
						const y = 50 - sectorRadius * Math.sin(a);
						const r = normalizeAngleDeg(-(a * 180) / Math.PI + 180);
						const flip = (r>90 && r<270) && flipText;
						return (
							<text
								key={i}
								x={x}
								y={flip ? y+1 : y}
								width={symbolSize}
								height={symbolSize}
								fontSize="1.5"
								fontWeight="bold"
								textAnchor={flip ? "end" : "start"}
								transform={flip ? `rotate(${r+180}, ${x}, ${y})` : `rotate(${r}, ${x}, ${y})`}
								style={{filter:"invert(1)", fontVariant: "small-caps"}}
							>
								{symbol}
							</text>
						);
					})
				}
				
				{/*Node symbols*/}
				{adjustedNodeAngles != null && 
					nodes.map((node, i) => {
						const a = adjustedNodeAngles.get(node);
						const z = Math.floor((((a-offset-siderealOffset)*6/Math.PI)%12+12)%12);
						const rad = planetRadius;
						const x = 50 + rad * Math.cos(a);
						const y = 50 - rad * Math.sin(a);
						const r = rotateSymbols ? -(a * 180) / Math.PI + 90 : 0;
						if ( showLabels && nodeSymbolHideable[node] ) {
							return null;
						}
						
						let filter: string;
						if (z == hoveredZodiac || (highlightedAspect != null && highlightedAspect.nodes.includes(node))) {
							filter = "url(#shadowAndInverted)";
						} else {
							filter = "url(#invert)";
						}
						
						return (
							<image
								key={i}
								href={nodeSymbols.get(node)}
								x={x-symbolSize/2}
								y={y-symbolSize/2}
								width={symbolSize}
								height={symbolSize}
								//transform={`rotate(${r}, ${x}, ${y})`}
								filter={filter}
								style = {{
									transition: "transform 0.5s ease",
									transform: `rotate(${r}deg)`,
									transformOrigin: `${x}px ${y}px`
								}}
							/>
						);
					})
				}
				
				{/*Node original placement indicators*/}
				{adjustedNodeAngles != null && 
					nodes.map((node, i) => {
						const a = nodeAngles.get(node);
						
						const r1 = aspectRadius + 1.25;
						const r2 = aspectRadius + 0.5;
						const x1 = 50 + r1 * Math.cos(a);
						const y1 = 50 - r1 * Math.sin(a);
						const x2 = 50 + r2 * Math.cos(a);
						const y2 = 50 - r2 * Math.sin(a);
						const pathData = [
							`M ${x1} ${y1}`,
							`L ${x2} ${y2}`,
							`Z`
						].join(" ");
						return (
							<path
								key={i}
								d={pathData}
								fill="none"
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
						const x = 50 + planetRadius * Math.cos(a);
						const y = 50 - planetRadius * Math.sin(a);
						const r = normalizeAngleDeg(-(a * 180) / Math.PI + 180);
						const flip = (r>90 && r<270) && flipText;
						var nodeName = node;
						if ( nodeShortName[node] ) {
							nodeName = nodeShortName[node];
						}
						let px = x;
						if ( nodeSymbolHideable[node] ) {
							px += flip ? + 0.9 + symbolSize : 0.9 - symbolSize;
						}
						return (
							<text
								key={i}
								x={flip ? px-0.6-symbolSize/2 : px+0.6+symbolSize/2}
								y={y+0.6}
								fontSize="1.5"
								fontWeight="bold"
								textAnchor={flip ? "end" : "start"}
								transform={flip ? `rotate(${r+180}, ${x}, ${y})` : `rotate(${r}, ${x}, ${y})`}
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
						
						if ( [AspectKind.CONJUNCTION, AspectKind.PARALLEL, AspectKind.CONTRAPARALLEL].includes(aspect.kind) ) {
							return null;
						}
						
						if (!aspect.nodes.every(node => nodeAngles.has(node))){
							return null;
						}
						
						const as: number[] = aspect.nodes
						.map( (node) => nodeAngles.get(node))
						.map( (a) => ((((a)%(2*Math.PI))+2*Math.PI)%(2*Math.PI)))
						.sort();
						const xs: number[] = as.map( (a) => 50 + aspectRadius * Math.cos(a));
						const ys: number[] = as.map( (a) => 50 - aspectRadius * Math.sin(a));
						
						let pathData: string;
						
						if (aspect.nodes.length == 2) {
							pathData = [
								`M ${xs[0]} ${ys[0]}`,
								`L ${xs[1]} ${ys[1]}`,
								`Z`
							].join(" ");
						} else if (aspect.nodes.length == 3) {
							pathData = [
								`M ${xs[0]} ${ys[0]}`,
								`L ${xs[1]} ${ys[1]}`,
								`L ${xs[2]} ${ys[2]}`,
								`L ${xs[0]} ${ys[0]}`,
								`Z`
							].join(" ");
						} else if (aspect.nodes.length == 4) {
							pathData = [
								`M ${xs[0]} ${ys[0]}`,
								`L ${xs[1]} ${ys[1]}`,
								`L ${xs[2]} ${ys[2]}`,
								`L ${xs[3]} ${ys[3]}`,
								`L ${xs[0]} ${ys[0]}`,
								`Z`
							].join(" ");
						} else if (aspect.nodes.length == 6) {
							pathData = [
								`M ${xs[0]} ${ys[0]}`,
								`L ${xs[3]} ${ys[3]}`,
								`M ${xs[1]} ${ys[1]}`,
								`L ${xs[4]} ${ys[4]}`,
								`M ${xs[2]} ${ys[2]}`,
								`L ${xs[5]} ${ys[5]}`,
								`Z`
							].join(" ");
						}
						
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
									strokeWidth={strokeWidthSecondary}
								/>
							);
						}
					})
				}

				{/*Zodiac symbol highlighting*/}
				{Array.from({ length: 12 }).map((_, i) => {
					const startA = (i/12) * 2 * Math.PI + offset + siderealOffset;
					const endA = ((i+1)/12) * 2 * Math.PI + offset + siderealOffset;
					
					const innerStart = {
						x: 50 + radius * Math.cos(startA),
						y: 50 - radius * Math.sin(startA)
					}
					const innerEnd = {
						x: 50 + radius * Math.cos(endA),
						y: 50 - radius * Math.sin(endA)
					}
					const outerStart = {
						x: 50 + sectorRadius * Math.cos(startA),
						y: 50 - sectorRadius * Math.sin(startA)
					}
					const outerEnd = {
						x: 50 + sectorRadius * Math.cos(endA),
						y: 50 - sectorRadius * Math.sin(endA)
					}

					const largeArc = endA - startA > Math.PI ? 1 : 0;
					
					const pathData = [
						`M ${innerStart.x} ${innerStart.y}`,
						`A ${radius} ${radius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
						`L ${outerEnd.x} ${outerEnd.y}`,
						`A ${sectorRadius} ${sectorRadius} 0 ${largeArc} 1 ${outerStart.x} ${outerStart.y}`,
						`Z`
					].join(" ");
					
					return (
						<path
							key={i}
							d={pathData}
							fill="url(#hoverGradient)"
							fillOpacity={hoveredZodiac === i ? 1 : 0}
							stroke="none"
							onMouseEnter={() => setHoveredZodiac(i)}
							onMouseLeave={() => setHoveredZodiac(null)}
							style={{ transition: "fill-opacity 0.6s ease" }}
						/>
					);
				})}
				<defs>
					// this radial gradient is from deepseek - I don't understand it too well.
					<radialGradient id="hoverGradient" cx="50%" cy="50%" r={sectorRadius+"%"} gradientUnits="userSpaceOnUse">
						<stop offset="35%" stopColor="rgba(255,255,255,0.9)"/>
						<stop offset="100%" stopColor="rgba(255,255,255,0)"/>
					</radialGradient>
					<filter id="path-glow" x="-400%" y="-400%" width="800%" height="800%">
						<feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
						<feMerge>
							<feMergeNode in="blur"/>
						</feMerge>
					</filter>
					<filter id="shadowAndInverted" x="-200%" y="-200%" width="400%" height="400%">
						<feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/>
						<feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="rgb(255, 255, 255)"/>
						<feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="rgb(255, 255, 255)"/>
					</filter>
					<filter id="invert">
						<feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/>
					</filter>
				</defs>
			</svg>
		</div>
	)
}

export default ZodiacWheel
