import React from "react";
import { Node, AspectKind, type Aspect } from './astro.ts';

import grandSextileSymbol from "./assets/aspect-symbols/Grand Sextile.png"
import grandSquareSymbol from "./assets/aspect-symbols/Grand Square.png"
import grandTrineSymbol from "./assets/aspect-symbols/Grand Trine.png"
import conjunctionSymbol from "./assets/aspect-symbols/Conjunction.png"
import oppositionSymbol from "./assets/aspect-symbols/Opposition.png"
import sextileSymbol from "./assets/aspect-symbols/Sextile.png"
import squareSymbol from "./assets/aspect-symbols/Square.png"
import trineSymbol from "./assets/aspect-symbols/Trine.png"

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

import dotSymbol from "./assets/general-symbols/Dot.png"

import "./AspectMenu.css";

function AspectMenu({ aspects, onDelete, onHover }: {
	aspects: Aspect[],
	onDelete: (aspect: Aspect) => void,
	onHover: (aspect: Aspect | null) => void
}) {
	
	const aspectSymbols = new Map<Node, string>([
		[AspectKind.GRAND_SEXTILE, grandSextileSymbol],
		[AspectKind.GRAND_SQUARE, grandSquareSymbol],
		[AspectKind.GRAND_TRINE, grandTrineSymbol],
		[AspectKind.CONJUNCTION, conjunctionSymbol],
		[AspectKind.OPPOSITION, oppositionSymbol],
		[AspectKind.SEXTILE, sextileSymbol],
		[AspectKind.SQUARE, squareSymbol],
		[AspectKind.TRINE, trineSymbol],
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
	
	//console.log(aspects[0].kind);
	//console.log(aspectSymbols.get(AspectKind.SQUARE));
	//console.log(aspectSymbols.get(aspects[0].kind));
	
	const symbolSize = 20;
	
	return (
		<div className="aspect-menu">
			<img
				key = {-1}
				src={earthSymbol}
				width={symbolSize}
				height={symbolSize}
				//style={{filter:"invert(1)"}}
			/>

			{aspects != null &&
				aspects.map((aspect, index) => (
					<div
						key={index}
						className="aspect-item"
						//todo
						onMouseEnter={() => {onHover(aspect)}}
						onMouseLeave={() => {onHover(null)}}
					>
						{/* aspect type icon */}
						<img
							src={aspectSymbols.get(aspect.kind)}
							alt={aspect.type}
							width={symbolSize}
							height={symbolSize}
							className="aspect-icon"
							style={{filter:"invert(1)"}}
						/>
						
						{/* node icons */}
						<div className="node-icons">
							{aspect.nodes.map((node, i) => (
								<img
									key={i}
									src={nodeSymbols.get(node)}
									alt={node}
									width={symbolSize}
									height={symbolSize}
									className="node-icon"
									style={{filter:"invert(1)"}}
								/>
							))}
							{Array.from({length: 6-aspect.nodes.length}).map((_, i) => (
								<img
									key={i+6}
									src={dotSymbol}
									alt={"bals"}
									width={symbolSize}
									height={symbolSize}
									className="node-icon"
									style={{filter:"invert(1)"}}
								/>
							))}
						</div>
						
						{/* error, quantile */}
						<div className="aspect-values">
							 {aspect.error.toFixed(2)}Δ - {aspect.percentile.toFixed(2)}%
						</div>
			  
						{/* delete button */}
						<button
							className="delete-button"
							onClick={() => onDelete(aspect)}
						>
							✕
						</button>
					</div>
				)
			)}
		</div>
	);
}

export default AspectMenu
