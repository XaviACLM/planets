import React from 'react';

import Aries from "./assets/zodiac-symbols/Aries.png"
import Taurus from "./assets/zodiac-symbols/Taurus.png"
import Gemini from "./assets/zodiac-symbols/Gemini.png"
import Cancer from "./assets/zodiac-symbols/Cancer.png"
import Leo from "./assets/zodiac-symbols/Leo.png"
import Virgo from "./assets/zodiac-symbols/Virgo.png"
import Libra from "./assets/zodiac-symbols/Libra.png"
import Scorpio from "./assets/zodiac-symbols/Scorpio.png"
import Sagittarius from "./assets/zodiac-symbols/Sagittarius.png"
import Capricorn from "./assets/zodiac-symbols/Capricorn.png"
import Aquarius from "./assets/zodiac-symbols/Aquarius.png"
import Pisces from "./assets/zodiac-symbols/Pisces.png"

const zodiacSymbols = [Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces];

function ZodiacWheel() {
	
	const radius = 35; // percent of viewport
	const symbolRadius = 40; // idem, slightly outside
	const hoveredSymbolRadius = 42;
	const sectorRadius = 45;
	
	const symbolSize = 4;
	const strokeWidthPrimary = 0.15;
	
	const [hovered, setHovered] = React.useState<number | null>(null);
	
	return (
		<div style={{background: "#000", width:"100vw", height: "100vh"}}>
			<svg
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid meet"
				style={{ width: "100%", height: "100%" }}
			>
				<circle cx="50%" cy="50%" r={radius} stroke="white" strokeWidth={strokeWidthPrimary} fill="none"/>
				
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
				
				{zodiacSymbols.map((symbol, i) => {
					const a = (i/12) * 2 * Math.PI;
					const x = 50 + symbolRadius * Math.cos(a);
					const y = 50 + symbolRadius * Math.sin(a);
					const r = (a * 180) / Math.PI + 90;
					return (
						<image
							key={i}
							href={symbol}
							x={x-symbolSize/2}
							y={y-symbolSize/2}
							width={symbolSize}
							height={symbolSize}
							transform={`rotate(${r}, ${x}, ${y}) translate(0, ${hovered === i ? -2 : 0})`}
							style={{ transition: "transform 0.5s ease", filter:"invert(1)"}}
						/>
					);
				})}
				
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
