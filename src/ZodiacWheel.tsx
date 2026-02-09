import { useState, useMemo } from 'react'

import ZodiacPositions from './zodiacPositions.ts'
import { type Aspect } from './aspects.ts'
import { Node, Zodiac, standardZodiac } from './astroDefs.ts'
import { AspectKind } from './aspectDefs.ts'
import { spreadIcons, normalizeAngleDeg, normalizeAngleRad } from './util.ts'
import { nodesWithRedundantSymbols, zodiacSymbols, nodeSymbols, earthSymbol, nodeShortName, aspectKindColors, nodePreferredName } from './astroGraphics.ts'
import { useSettingsStore } from './settingsStore.ts'
import { Theme } from './settingsDefs.ts'

function aspectPathData(aspect: Aspect, nodeAngles: Map<Node, number>, aspectRadius: number){
	const as: number[] = aspect.nodes
	.map( (node) => nodeAngles.get(node)!)
	.map( (a: number) => (normalizeAngleRad(a)))
	.sort();
	const xs: number[] = as.map( (a) => 50 + aspectRadius * Math.cos(a));
	const ys: number[] = as.map( (a) => 50 - aspectRadius * Math.sin(a));
	
	if (aspect.nodes.length == 2) {
		return [
			`M ${xs[0]} ${ys[0]}`,
			`L ${xs[1]} ${ys[1]}`
		].join(" ");
	} else if (aspect.nodes.length == 3) {
		return [
			`M ${xs[0]} ${ys[0]}`,
			`L ${xs[1]} ${ys[1]}`,
			`L ${xs[2]} ${ys[2]}`,
			`Z`
		].join(" ");
	} else if (aspect.nodes.length == 4) {
		return [
			`M ${xs[0]} ${ys[0]}`,
			`L ${xs[1]} ${ys[1]}`,
			`L ${xs[2]} ${ys[2]}`,
			`L ${xs[3]} ${ys[3]}`,
			`Z`
		].join(" ");
	} else if (aspect.nodes.length == 6) {
		return [
			`M ${xs[0]} ${ys[0]}`,
			`L ${xs[3]} ${ys[3]}`,
			`M ${xs[1]} ${ys[1]}`,
			`L ${xs[4]} ${ys[4]}`,
			`M ${xs[2]} ${ys[2]}`,
			`L ${xs[5]} ${ys[5]}`,
		].join(" ");
	} else {
		throw new Error(`Unexpected number of nodes: ${aspect.nodes.length}`);
	}
}

function ZodiacWheel({ zodiacPositions, aspects, highlightedAspect}: {
	zodiacPositions: ZodiacPositions,
	aspects: Aspect[],
	highlightedAspect: Aspect | null
}) {
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const showSymbolLabels = useSettingsStore(s => s.showSymbolLabels);
	const flipText = useSettingsStore(s => s.flipText);
	const housePresweep = useSettingsStore(s => s.housePresweep);
	const rotateSymbols = useSettingsStore(s => s.rotateSymbols);
	const aspectsColorcoded = useSettingsStore(s => s.aspectsColorcoded);
	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	const theme = useSettingsStore(s => s.theme);
	const isDarkTheme = theme === Theme.DARK;
	
	const sectorRadius = 48;
	const symbolRadius = 43.5;
	const radius = 39; // percent of viewport
	const aspectRadius = showNodeLabels ? 23 : 28;
	const planetRadius = showNodeLabels ? 35 : (radius+aspectRadius)/2;
	
	const minimumIconSpace = 0.12; // radial
	
	const symbolSize = 4;
	const strokeWidthPrimary = 0.15;
	const strokeWidthSecondary = 0.1;
	const strokeWidthTertiary = 0.05;
	const blurBaseWidth = 2;
	
	const { offset, nodeAngles, houseCuspAngles, siderealOffset } = useMemo(() => {
		
		const offset = zodiacPositions.hasSurfacePosition() ?
			Math.PI - zodiacPositions.getNodePosition(Node.ASCENDANT)
			: -Math.PI/12;
		
		// this is vestigial, but it will be useful in the future to implement anglo style
		const nodeAngles = new Map<Node, number>();
		zodiacPositions.getNodePositions().forEach((position, node) => {
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
		
		const nodes = [...nodeAngles.keys()];
		const adjustedMap = new Map<Node, number>();
		//Array.from(nodeAngles.keys()).forEach((node, index) => {
		nodes.forEach((node, index) => {
			adjustedMap.set(node, adjustedPositions[index]);
		});
		return adjustedMap;
	}, [nodeAngles]);

	const zodiac: Map<Zodiac, number> = zodiacPositions.getZodiacSymbolPositions();
	const nodes: Node[] = Array.from(nodeAngles.keys());
	
	const [hoveredZodiac, setHoveredZodiac] = useState<Zodiac | null>(null);
	
	return (
		<div className="bg-theme-bg w-screen h-screen">
			<svg
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid meet"
				className="w-full h-full"
			>
				<circle cx="50%" cy="50%" r={radius} stroke="var(--color-text)" strokeWidth={strokeWidthPrimary} fill="none"/>
				<circle cx="50%" cy="50%" r={radius-0.5} stroke="var(--color-text)" strokeWidth={strokeWidthSecondary} fill="none"/>
				
				<circle cx="50%" cy="50%" r={aspectRadius} stroke="var(--color-text)" strokeWidth={strokeWidthPrimary} fill="none"/>
				<circle cx="50%" cy="50%" r={aspectRadius+0.5} stroke="var(--color-text)" strokeWidth={strokeWidthSecondary} fill="none"/>
				
				<circle cx="50%" cy="50%" r={aspectRadius * 1/2} stroke="var(--color-text)" strokeWidth={strokeWidthTertiary} fill="none"/> // trines
				<circle cx="50%" cy="50%" r={aspectRadius * (Math.sqrt(2)/2)} stroke="var(--color-text)" strokeWidth={strokeWidthTertiary} fill="none"/> // squares
				<circle cx="50%" cy="50%" r={aspectRadius * (Math.sqrt(3)/2)} stroke="var(--color-text)" strokeWidth={strokeWidthTertiary} fill="none"/> // sextiles

				<image
					key={0}
					href={earthSymbol}
					x={50-symbolSize/2}
					y={50-symbolSize/2}
					width={symbolSize}
					height={symbolSize}
					style={{filter:"var(--icon-filter)"}}
				/>
				
				{/*Outer zodiac sector separators*/}
				{Array.from(zodiac.values()).map((lon, index) => {
					const a = lon + offset;
					return (
						<line
							key={index}
							x1={50 + radius * Math.cos(a)}
							y1={50 - radius * Math.sin(a)}
							x2={50 + sectorRadius * Math.cos(a)}
							y2={50 - sectorRadius * Math.sin(a)}
							stroke="var(--color-text)"
							strokeWidth={strokeWidthPrimary}
							
						/>
					);
				})}
				
				{/*House separators*/}
				{zodiacPositions.houseCuspsAreDefined()
				&& houseCuspAngles.map((lon, index) => {
					const a = lon + offset + ( housePresweep ? -Math.PI/36 : 0 ); //5º presweep
					return (
						<line
							key={index}
							x1={50 + (radius - 3) * Math.cos(a)}
							y1={50 - (radius - 3) * Math.sin(a)}
							x2={50 + (aspectRadius + 3) * Math.cos(a)}
							y2={50 - (aspectRadius + 3) * Math.sin(a)}
							stroke="var(--color-text)"
							strokeWidth={strokeWidthTertiary}
							
						/>
					);
				})}
				
				{/*Sign separators if no houses*/}
				{/*Hidden for now. Might be confusing, not really important to have*/}
				{/*
				{!zodiacPositions.houseCuspsAreDefined()
				&& Array.from(zodiac.values()).map((lon, index) => {
					const a = lon + offset;
					return (
						<line
							key={index}
							x1={50 + (radius - 3) * Math.cos(a)}
							y1={50 - (radius - 3) * Math.sin(a)}
							x2={50 + (aspectRadius + 3) * Math.cos(a)}
							y2={50 - (aspectRadius + 3) * Math.sin(a)}
							stroke="var(--color-text)"
							strokeWidth={strokeWidthTertiary}
							
						/>
					);
				})}
				*/}
				
				{/*House presweep line*/}
				{housePresweep
				&& zodiacPositions.houseCuspsAreDefined()
				&& houseCuspAngles.map((lon, index) => {
					const a = lon + offset;
					return (
						<line
							key={index}
							x1={50 + (aspectRadius + 3) * Math.cos(a)}
							y1={50 - (aspectRadius + 3) * Math.sin(a)}
							x2={50 + (radius - 3) * Math.cos(a)}
							y2={50 - (radius - 3) * Math.sin(a)}
							stroke="var(--color-text)"
							strokeWidth={strokeWidthTertiary}
							strokeDasharray="0.2,0.5"
						/>
					);
				})}
				
				{/*House cusp labels*/}
				{zodiacPositions.houseCuspsAreDefined()
				&& houseCuspAngles.map((lon, index) => {
					const a = lon + offset;
					const r = normalizeAngleDeg(-(a * 180) / Math.PI + 180);
					const flip = (r>90 && r<270) && flipText;
					const adj = flip ? 0.01 : -0.01; //perfect alignment w/ house separators
					const x = 50 + (radius-1) * Math.cos(a+adj);
					const y = 50 - (radius-1) * Math.sin(a+adj);
					const cuspName = "H"+String(index+1)
					return (
						<text fill="var(--color-text)"
							key={index}
							x={x}
							y={y+0.6}
							fontSize="1"
							fontWeight="bold"
							textAnchor={flip ? "end" : "start"}
							transform={flip ? `rotate(${r+180}, ${x}, ${y})` : `rotate(${r}, ${x}, ${y})`}
							style={{fontVariant: "small-caps"}}
						>
							{cuspName}
						</text>
					);
				}) }
				
				{/*Zodiac symbols*/}
				{Array.from(zodiac.entries()).map(([symbol, lon], i, array) => {
					const nextLon = array[(i + 1)%array.length][1];
					const a = (
						lon < nextLon ?
						(lon+nextLon)/2 :
						normalizeAngleRad((lon+nextLon)/2+Math.PI)
					) + offset;
					const x = 50 + symbolRadius * Math.cos(a);
					const y = 50 - symbolRadius * Math.sin(a);
					const r = rotateSymbols ? -(a * 180) / Math.PI + 90 : 0;
					const translateY = hoveredZodiac === symbol ? -1 : 0;
					return (
						<image
							key={i}
							href={zodiacSymbols[symbol]}
							x={x-symbolSize/2}
							y={y-symbolSize/2}
							width={symbolSize}
							height={symbolSize}
							style={{
								transition: "transform 0.5s ease",
								filter:"var(--icon-filter)",
								transform: `rotate(${r}deg) translateY(${translateY}px)`,
								transformOrigin: `${x}px ${y}px`
							}}
						/>
					);
				})}
				
				{/*Zodiac labels*/}
				{showSymbolLabels && 
					Array.from(zodiac.entries()).map(([symbol, _], i, array) => {
						const lon = array[(i+1)%array.length][1];
						const a = lon - 0.01 + offset;
						const x = 50 + sectorRadius * Math.cos(a);
						const y = 50 - sectorRadius * Math.sin(a);
						const r = normalizeAngleDeg(-(a * 180) / Math.PI + 180);
						const flip = (r>90 && r<270) && flipText;
						return (
							<text fill="var(--color-text)"
								key={i}
								x={x}
								y={flip ? y+1 : y}
								fontSize="1.5"
								fontWeight="bold"
								textAnchor={flip ? "end" : "start"}
								transform={flip ? `rotate(${r+180}, ${x}, ${y})` : `rotate(${r}, ${x}, ${y})`}
								style={{fontVariant: "small-caps"}}
							>
								{symbol}
							</text>
						);
					})
				}
				
				{/*Node symbols*/}
				{adjustedNodeAngles != null && 
					nodes.map((node, i) => {
						const a = adjustedNodeAngles.get(node)!;
						const z = zodiacPositions.getSymbolOfNode(node);
						const rad = planetRadius;
						const x = 50 + rad * Math.cos(a);
						const y = 50 - rad * Math.sin(a);
						const r = rotateSymbols ? -(a * 180) / Math.PI + 90 : 0;
						if ( showNodeLabels && nodesWithRedundantSymbols.includes(node) ) {
							return null;
						}
						
						const isHighlighted = z == hoveredZodiac || highlightedAspect?.nodes.includes(node);
						const filter = "var(--icon-filter)" + (isHighlighted ? "url(#shadow)" : "");
						
						return (
							<image
								key={i}
								href={nodeSymbols[node]}
								x={x-symbolSize/2}
								y={y-symbolSize/2}
								width={symbolSize}
								height={symbolSize}
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
						const a = nodeAngles.get(node)!;
						
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
								stroke="var(--color-text)"
								strokeWidth={strokeWidthPrimary}
							/>
						);
					})
				}
				
				{/*Node labels*/}
				{adjustedNodeAngles != null && showNodeLabels && 
					nodes.map((node, i) => {
						const a = adjustedNodeAngles.get(node)!;
						const x = 50 + planetRadius * Math.cos(a);
						const y = 50 - planetRadius * Math.sin(a);
						const r = normalizeAngleDeg(-(a * 180) / Math.PI + 180);
						const flip = (r>90 && r<270) && flipText;
						const nodeName = nodeShortName[node] || nodePreferredName[node] || node;
						let px = x;
						if ( nodesWithRedundantSymbols.includes(node) ) {
							px += flip ? + 0.9 + symbolSize : 0.9 - symbolSize;
						}
						return (
							<text fill="var(--color-text)"
								key={i}
								x={flip ? px-0.6-symbolSize/2 : px+0.6+symbolSize/2}
								y={y+0.6}
								fontSize="1.5"
								fontWeight="bold"
								textAnchor={flip ? "end" : "start"}
								transform={flip ? `rotate(${r+180}, ${x}, ${y})` : `rotate(${r}, ${x}, ${y})`}
								style={{fontVariant: "small-caps"}}
							>
								{nodeName}
							</text>
						);
					})
				}
				
				{/*Highlighted aspect*/}
				{ highlightedAspect != null && (() => {
						
					if ( AspectKind.CONJUNCTION == highlightedAspect.kind ) {
						return null;
					}
						
					const pathData = aspectPathData(highlightedAspect, nodeAngles, aspectRadius);
		
					const stroke = (() => {
						const color = aspectKindColors[highlightedAspect.kind];
						if (!aspectsColorcoded || color === undefined){
							return "var(--color-text)";
						}
						const [r,g,b] =  color;
						return `rgb(${r},${g},${b})`;
					})();
					
					return (
						<path
							key={-1000-aspects.indexOf(highlightedAspect)}
							d={pathData}
							fill="none"
							stroke={stroke}
							strokeWidth={blurBaseWidth}
							filter="url(#path-glow)"
							opacity={0}
							style={{ transition: 'opacity 0.6s ease' }}
							ref={node => {
								if (node) {
									requestAnimationFrame(() => {
										node.style.opacity = "1";
									});
								}
							}}
						/>
					);
				})()}
				
				{/*Equinox (equator) line for parallels*/}
				{ highlightedAspect != null
				&& (([AspectKind.PARALLEL, AspectKind.CONTRAPARALLEL] as AspectKind[]).includes(highlightedAspect.kind))
				&& (() => {
					// autumnal and vernal equinoxes
					const a1 = 0 + offset;
					const a2 = Math.PI + offset;
					const x1 = 50 + aspectRadius * Math.cos(a1);
					const x2 = 50 + aspectRadius * Math.cos(a2);
					const y1 = 50 - aspectRadius * Math.sin(a1);
					const y2 = 50 - aspectRadius * Math.sin(a2);
					const pathData = [
						`M ${x1} ${y1}`,
						`L ${x2} ${y2}`
					].join(" ");	
		
					const stroke = (() => {
						const color = aspectKindColors[highlightedAspect.kind];
						if (!aspectsColorcoded || color === undefined){
							return "var(--color-text)";
						}
						const [r,g,b] =  color;
						return `rgb(${r},${g},${b})`;
					})();
					
					return (
						<path
							key={-1000000}
							d={pathData}
							fill="none"
							stroke={stroke}
							strokeWidth={blurBaseWidth}
							filter="url(#path-glow)"
							opacity={0}
							style={{ transition: 'opacity 0.6s ease' }}
							ref={node => {
								if (node) {
									requestAnimationFrame(() => {
										node.style.opacity = "1";
									});
								}
							}}
						/>
					);
				})()}
				
				{/*Aspects*/}
				{aspects != null &&
					aspects.map((aspect, i) => {
						
						if ( AspectKind.CONJUNCTION == aspect.kind ){
							return null;
						}
						
						if ( !aspect.nodes.every(node => selectedNodes.has(node)) ){
							return null;
						}
						
						const pathData = aspectPathData(aspect, nodeAngles, aspectRadius);
						
						const stroke = (() => {
							const color = aspectKindColors[aspect.kind];
							if (!aspectsColorcoded || color === undefined){
								return "var(--color-text)";
							}
							const [r,g,b] =  color;
							return `rgb(${r},${g},${b})`;
						})();
						
						const strokeWidth = aspectsColorcoded ? strokeWidthPrimary*2 : strokeWidthPrimary;
						
						return (
							<path
								key={i}
								d={pathData}
								fill="none"
								stroke={stroke}
								strokeWidth={strokeWidth}
							/>
						);
					})
				}

				{/* Zodiac sector highlighting */}
				{Array.from(zodiac.entries()).map(([symbol, lon], i, array) => {
					const nextLon = array[(i + 1)%array.length][1];
					const startA = lon + offset;
					const endA = nextLon + offset;
					
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
							fillOpacity={hoveredZodiac === symbol ? 1 : 0}
							stroke="none"
							onMouseEnter={() => setHoveredZodiac(symbol)}
							onMouseLeave={() => setHoveredZodiac(null)}
							style={{ transition: "fill-opacity 0.6s ease" }}
						/>
					);
				})}
				<defs>
					// this radial gradient is from deepseek - I don't understand it too well.
					<radialGradient id="hoverGradient" cx="50%" cy="50%" r={sectorRadius+"%"} gradientUnits="userSpaceOnUse">
						<stop offset="35%" stopColor={isDarkTheme ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)"}/>
						<stop offset="100%" stopColor={isDarkTheme ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)"}/>
					</radialGradient>
					<filter id="path-glow" x="-400%" y="-400%" width="800%" height="800%">
						<feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
						<feFlood floodColor={isDarkTheme ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"} floodOpacity={isDarkTheme ? 0.8 : 0.5} result="color"/>
						<feComposite in="color" in2="blur" operator="in" result="glow"/>
						<feMerge>
							<feMergeNode in="glow"/>
						</feMerge>
					</filter>
					<filter id="shadow" x="-200%" y="-200%" width="400%" height="400%">
						<feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor={isDarkTheme ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"} floodOpacity={1}/>
					</filter>
					<filter id="shadowAndInverted" x="-200%" y="-200%" width="400%" height="400%">
						{isDarkTheme && <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/>}
						<feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor={isDarkTheme ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"} floodOpacity={isDarkTheme ? 1 : 0.6}/>
						<feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor={isDarkTheme ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"} floodOpacity={isDarkTheme ? 1 : 0.6}/>
					</filter>
					<filter id="invert">
						{isDarkTheme && <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/>}
					</filter>
				</defs>
			</svg>
		</div>
	)
}

export default ZodiacWheel
