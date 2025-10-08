import React from 'react';

import { Observer, Body, Equator, GeoVector } from "astronomy-engine";

import { ConditionalRender } from "./ConditionalRender"

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

function ZodiacWheel({ showLabels }: {showLabels: boolean}) {
	
	const radius = 35; // percent of viewport
	const symbolRadius = 40;
	const hoveredSymbolRadius = 42;
	const sectorRadius = 45;
	const planetRadius = 30;
	
	const symbolSize = 4;
	const strokeWidthPrimary = 0.15;
	
	const correct_for_aberration = true;
	
	// todo find ascendant (position), lunar ascending, lunar descending
	// todo aspects (conjunction, opposition, sextile, square, trine)
	// ...with a nice menu on the side
	
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
	
	const bodySymbols = new Map<Body, string>([
		[Body.Sun, sunSymbol],
		[Body.Moon, moonSymbol],
		[Body.Mercury, mercurySymbol],
		[Body.Venus, venusSymbol],
		[Body.Mars, marsSymbol],
		[Body.Jupiter, jupiterSymbol],
		[Body.Saturn, saturnSymbol],
		[Body.Uranus, uranusSymbol],
		[Body.Neptune, neptuneSymbol],
		[Body.Pluto, plutoSymbol]
	]);
	
	const zodiac: Body[] = Array.from(zodiacSymbols.keys());
	const bodies: Body[] = Array.from(bodySymbols.keys());
	
	const bodyAngles = new Map<Body, number>();
	
	for (let body of bodies) {
		const v = GeoVector(body, new Date(), correct_for_aberration);
		bodyAngles.set(body, Math.atan2(v.y, v.x));
	}
	
	
	const [hovered, setHovered] = React.useState<number | null>(null);
	
	return (
		<div style={{background: "#000", width:"100vw", height: "100vh"}}>
			<svg
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid meet"
				style={{ width: "100%", height: "100%" }}
			>
				<circle cx="50%" cy="50%" r={radius} stroke="white" strokeWidth={strokeWidthPrimary} fill="none"/>
				
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
				
				<ConditionalRender condition={showLabels}>
					{zodiac.map((symbol, i) => {
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
					})}
				</ConditionalRender>
				
				{bodies.map((body, i) => {
					const a = bodyAngles.get(body);
					const x = 50 + planetRadius * Math.cos(a);
					const y = 50 + planetRadius * Math.sin(a);
					const r = (a * 180) / Math.PI + 90;
					return (
						<image
							key={i}
							href={bodySymbols.get(body)}
							x={x-symbolSize/2}
							y={y-symbolSize/2}
							width={symbolSize}
							height={symbolSize}
							transform={`rotate(${r}, ${x}, ${y})`}
							style={{filter:"invert(1)"}}
						/>
					);
				})}
				
				<ConditionalRender condition={showLabels}>
					{bodies.map((body, i) => {
						const a = bodyAngles.get(body);
						const x = 50 + planetRadius * Math.cos(a);
						const y = 50 + planetRadius * Math.sin(a);
						const r = (a * 180) / Math.PI + 180;
						return (
							<text
								key={i}
								x={x+0.6+symbolSize/2}
								y={y+0.6}
								width={symbolSize}
								height={symbolSize}
								fontSize="1.5"
								fontWeight="bold"
								transform={`rotate(${r}, ${x}, ${y})`}
								style={{filter:"invert(1)", fontVariant: "small-caps"}}
							>
								{body}
							</text>
						);
					})}
				</ConditionalRender>
				
				/*
				a notion of impressiveness: vs n points distributed randomly, if we were to compute their error wrt being an n-gon (sth sth minimal transport), at what percentile is this particular configuration?
				
				sth sth minimal transport isn't obvious, is it? 
				the transports will be in order. easy to prove
				
				wait, but that implies working through all possible permutations. no bueno!
				we should restrict ourselves to some maximum supremum distance
				should make it easier to enumerate candidates, then
				
				or something like it...
				somewhat straightforward to enumerate all 6 element subsequences
				now do the same but during exploration put some constraints on distances between the elements
				but what constraints?
				some parts of this idea don't sit well with me. i wouldn't want to discard
				a perfect-except-for-one grand sextile, but this would.
				can we keep, during exploration, a prelimiary "minimum error"? and discard above a certain error, below a certain impressiveness?
				*/
				
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
					<radialGradient id="hoverGradient" cx="50%" cy="50%" r={sectorRadius+"%"} gradientUnits="userSpaceOnUse">
						<stop offset="35%" stopColor="rgba(255,255,255,0.9)"/>
						<stop offset="100%" stopColor="rgba(255,255,255,0)"/>
					</radialGradient>
				</defs>
			</svg>
		</div>
	)
}

export default ZodiacWheel
