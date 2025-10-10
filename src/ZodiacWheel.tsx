import React from 'react';

import { Node, NodeToBody, type Aspect, AspectKind} from './astro.ts'

import ariesSymbol from "./assets/zodiac-symbols/Aries.png"
import taurusSymbol from "./assets/zodiac-symbols/Taurus.png"
import geminiSymbol from "./assets/zodiac-symbols/Gemini.png"
import cancerSymbol from "./assets/zodiac-symbols/Cancer.png"
import leoSymbol from "./assets/zodiac-symbols/Leo.png"
import virgoSymbol from "./assets/zodiac-symbols/Virgo.png"
import libraSymbol from "./assets/zodiac-symbols/Libra.png"
import scorpioSymbol from "./assets/zodiac-symbols/Scorpio.png"
import sagittariusSymbol from "./assets/zodiac-symbols/Sagittarius.png"
import capricornSymbol from "./assets/zodiac-symbols/Capricorn.png"
import aquariusSymbol from "./assets/zodiac-symbols/Aquarius.png"
import piscesSymbol from "./assets/zodiac-symbols/Pisces.png"

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
import lunarAscendingSymbol from "./assets/body-symbols/Lunar Ascending.png"
import lunarDescendingSymbol from "./assets/body-symbols/Lunar Descending.png"

enum Zodiac{
  Aries = 'Aries',
  Taurus = 'Taurus', 
  Gemini = 'Gemini',
  Cancer = 'Cancer',
  Leo = 'Leo',
  Virgo = 'Virgo',
  Libra = 'Libra',
  Scorpio = 'Scorpio',
  Sagittarius = 'Sagittarius',
  Capricorn = 'Capricorn',
  Aquarius = 'Aquarius',
  Pisces = 'Pisces'
}

function ZodiacWheel({ showLabels, nodeAngles, aspects, highlightedAspect}: {
	showLabels: boolean,
	nodeAngles: Map<Node, number> | null,
	aspects: Aspect[] | null,
	highlightedAspect: Aspect | null
}) {
	
	const radius = 35; // percent of viewport
	const symbolRadius = 40;
	const hoveredSymbolRadius = 42;
	const sectorRadius = 45;
	const planetRadius = 30;
	const aspectRadius = 20;
	
	const symbolSize = 4;
	const strokeWidthPrimary = 0.15;
	const strokeWidthSecondary = 0.1;
	const strokeWidthTertiary = 0.05;
	const blurBaseWidth = 2;
	
	const zodiacSymbols = new Map<Zodiac, string>([
		[Zodiac.Aries, ariesSymbol],
		[Zodiac.Taurus, taurusSymbol],
		[Zodiac.Gemini, geminiSymbol],
		[Zodiac.Cancer, cancerSymbol],
		[Zodiac.Leo, leoSymbol],
		[Zodiac.Virgo, virgoSymbol],
		[Zodiac.Libra, libraSymbol],
		[Zodiac.Scorpio, scorpioSymbol],
		[Zodiac.Sagittarius, sagittariusSymbol],
		[Zodiac.Capricorn, capricornSymbol],
		[Zodiac.Aquarius, aquariusSymbol],
		[Zodiac.Pisces, piscesSymbol]
	]);
	
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
		[Node.LUNAR_ASCENDING, lunarAscendingSymbol],
		[Node.LUNAR_DESCENDING, lunarDescendingSymbol]
	]);

	const zodiac: Zodiac[] = Array.from(zodiacSymbols.keys());
	// TODO remove this when we have all nodes
	const nodes: Node[] = Array.from(nodeSymbols.keys());
	
	const [hovered, setHovered] = React.useState<number | null>(null);
	
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
				
				{Array.from({ length: 12 }).map((_, i) => {
					const a = ((2*i+1)/24) * 2 * Math.PI;
					return (
						<line
							key={i}
							x1={50 + radius * Math.cos(a)}
							y1={50 + radius * Math.sin(a)}
							x2={50 + sectorRadius * Math.cos(a)}
							y2={50 + sectorRadius * Math.sin(a)}
							stroke="white"
							strokeWidth={strokeWidthPrimary}
							
						/>
					);
				})}
				
				{zodiac.map((symbol, i) => {
					const a = (i/12) * 2 * Math.PI;
					const x = 50 + symbolRadius * Math.cos(a);
					const y = 50 + symbolRadius * Math.sin(a);
					const r = (a * 180) / Math.PI + 90;
					return (
						<image
							key={i}
							href={zodiacSymbols.get(symbol)}
							x={x-symbolSize/2}
							y={y-symbolSize/2}
							width={symbolSize}
							height={symbolSize}
							transform={`rotate(${r}, ${x}, ${y}) translate(0, ${hovered === i ? -2 : 0})`}
							style={{ transition: "transform 0.5s ease", filter:"invert(1)"}}
						/>
					);
				})}
				
				{showLabels && 
					zodiac.map((symbol, i) => {
						const a = ((2*i-1)/24) * 2 * Math.PI +0.01;
						const x = 50 + sectorRadius * Math.cos(a);
						const y = 50 + sectorRadius * Math.sin(a);
						const r = (a * 180) / Math.PI + 180;
						return (
							<text
								key={i}
								x={x}
								y={y}
								width={symbolSize}
								height={symbolSize}
								fontSize="1.5"
								fontWeight="bold"
								transform={`rotate(${r}, ${x}, ${y})`}
								style={{filter:"invert(1)", fontVariant: "small-caps"}}
							>
								{symbol}
							</text>
						);
					})
				}
				
				{nodeAngles != null && 
					nodes.map((node, i) => {
						const a = nodeAngles.get(node);
						const x = 50 + planetRadius * Math.cos(a);
						const y = 50 + planetRadius * Math.sin(a);
						const r = (a * 180) / Math.PI + 90;
						if ( showLabels && node === Node.ASCENDANT ) {
							return null;
						}
						return (
							<image
								key={i}
								href={nodeSymbols.get(node)}
								x={x-symbolSize/2}
								y={y-symbolSize/2}
								width={symbolSize}
								height={symbolSize}
								transform={`rotate(${r}, ${x}, ${y})`}
								style={{filter:"invert(1)"}}
							/>
						);
					})
				}
				
				{nodeAngles != null && showLabels && 
					nodes.map((node, i) => {
						const a = nodeAngles.get(node);
						const x = 50 + planetRadius * Math.cos(a);
						const y = 50 + planetRadius * Math.sin(a);
						const r = (a * 180) / Math.PI + 180;
						var nodeName = node;
						if ( node === Node.LUNAR_ASCENDING ) {
							nodeName = "Lunar ⬆";
						} else if ( node === Node.LUNAR_DESCENDING ) {
							nodeName = "Lunar ⬇";
						}
						return (
							<text
								key={i}
								x={node === Node.ASCENDANT ? x-0.3-symbolSize/2 : x+0.6+symbolSize/2}
								y={y+0.6}
								width={symbolSize}
								height={symbolSize}
								fontSize="1.5"
								fontWeight="bold"
								transform={`rotate(${r}, ${x}, ${y})`}
								style={{filter:"invert(1)", fontVariant: "small-caps"}}
							>
								{nodeName}
							</text>
						);
					})
				}
				
				{aspects != null && 
					aspects.map((aspect, i) => {
						
						const as: number[] = aspect.nodes
						.map( (node) => nodeAngles.get(node))
						.map( (a) => ((((a)%(2*Math.PI))+2*Math.PI)%(2*Math.PI)))
						.sort();
						const xs: number[] = as.map( (a) => 50 + aspectRadius * Math.cos(a));
						const ys: number[] = as.map( (a) => 50 + aspectRadius * Math.sin(a));
						
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
								<>
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
								</>
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

				{Array.from({ length: 12 }).map((_, i) => {
					const startA = ((2*i-1)/24) * 2 * Math.PI;
					const endA = ((2*i+1)/24) * 2 * Math.PI;
					
					const innerStart = {
						x: 50 + radius * Math.cos(startA),
						y: 50 + radius * Math.sin(startA)
					}
					const innerEnd = {
						x: 50 + radius * Math.cos(endA),
						y: 50 + radius * Math.sin(endA)
					}
					const outerStart = {
						x: 50 + sectorRadius * Math.cos(startA),
						y: 50 + sectorRadius * Math.sin(startA)
					}
					const outerEnd = {
						x: 50 + sectorRadius * Math.cos(endA),
						y: 50 + sectorRadius * Math.sin(endA)
					}

					const largeArc = endA - startA > Math.PI ? 1 : 0;
					
					const pathData = [
						`M ${innerStart.x} ${innerStart.y}`,
						`A ${radius} ${radius} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
						`L ${outerEnd.x} ${outerEnd.y}`,
						`A ${sectorRadius} ${sectorRadius} 0 ${largeArc} 0 ${outerStart.x} ${outerStart.y}`,
						`Z`
					].join(" ");
					
					return (
						<path
							key={i}
							d={pathData}
							fill="url(#hoverGradient)"
							fillOpacity={hovered === i ? 1 : 0}
							stroke="none"
							onMouseEnter={() => setHovered(i)}
							onMouseLeave={() => setHovered(null)}
							style={{ transition: "fill-opacity 0.6s ease" }}
						/>
					);
				})}
				<defs>
					// the radial gradient is from deepseek - I don't understand it too well.
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
				</defs>
			</svg>
		</div>
	)
}

export default ZodiacWheel
