import { useState, useEffect } from 'react'

import { Body, GeoVector, Ecliptic, GeoMoonState, MakeTime, SiderealTime } from "astronomy-engine";

import ZodiacWheel from './ZodiacWheel'
import AspectMenu from './AspectMenu'
import { Node, NodeToBody, findAspects, type Aspect } from './astro.ts'

import "./App.css";

function normalizeAngleRad(a: number) {
  // normalize to [0, 2π)
  const twoPi = 2*Math.PI;
  return ((a % twoPi) + twoPi) % twoPi;
}

function App() {
	
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [showLabels, setShowLabels] = useState<boolean>(true);
	const [nodeAngles, setNodeAngles] = useState<Map<Node, number> | null>(null);
	const [aspects, setAspects] = useState<Aspect[] | null>(null);
	const [highlightedAspect, setHighlightedAspect] = useState<Aspect | null>(null);
	
	const correct_for_aberration = true;

	useEffect(() => {
		const tempNodeAngles = new Map<Node, number>();
			
		for ( const [node, body] of Object.entries(NodeToBody)) {
			const eqj = GeoVector(body, new Date(), correct_for_aberration)
			const etc = Ecliptic(eqj);
			tempNodeAngles.set(node, (etc.elon-15)/360*2*Math.PI);
		}
		
		
		const date = new Date();
		const s = GeoMoonState(date);
		
		const r = { x: s.x, y: s.y, z: s.z };
		const v = { x: s.vx, y: s.vy, z: s.vz };
		const h = {
			x: r.y * v.z - r.z * v.y,
			y: r.z * v.x - r.x * v.z,
			z: r.x * v.y - r.y * v.x,
			t: MakeTime(date)
		};
		
		const hEcl = Ecliptic(h).vec; // { x, y, z } in ecliptic frame
		const omega = Math.atan2(hEcl.x, -hEcl.y) - 15/360*2*Math.PI;
		tempNodeAngles.set(Node.LUNAR_ASCENDING, normalizeAngleRad(omega));
		tempNodeAngles.set(Node.LUNAR_DESCENDING, normalizeAngleRad(omega + Math.PI));


		const latitudeDeg = 41.3874;
		const longitudeDeg = 2.1686;
		
		const gstHours = SiderealTime(date);
		const lstHours = gstHours + longitudeDeg / 15.0;
		const lstHoursNorm = ((lstHours % 24) + 24) % 24;
		const theta = lstHoursNorm * Math.PI / 12
		
		// todo do this better
		const epsRad = 23.43 * Math.PI / 180.0;
			
		const phi = latitudeDeg * Math.PI/180;
		
		const x = Math.cos(theta);
		const y = - (Math.sin(theta) * Math.cos(epsRad) + Math.tan(phi) * Math.sin(epsRad));
		const lambda = Math.atan2(x,y)-Math.PI/12;
		const lambdaAdj = ((lambda%(2*Math.PI)) + 2*Math.PI) % (2*Math.PI);

		tempNodeAngles.set(Node.ASCENDANT, lambdaAdj);
			
			
		setNodeAngles(tempNodeAngles);
		
		setAspects(findAspects(tempNodeAngles));
		
	}, []);
	
	return (
		<div className="app-container" style={{ position: "relative", height: "100vh" }}>
			<div className="sidebar">
				<AspectMenu
					aspects={aspects}
					onHover={(aspect) => {setHighlightedAspect(aspect)}}
					onDelete={(aspect) => setAspects(prev => prev.filter(a => a !== aspect))}
				/>
			</div>
			<div className="wheel-area">
				<div
					style={{
						position: "absolute",
						top: "1rem",
						right: "1rem",
						background: "black",
						padding: "0.5rem",
						color: "white",
						border: "1px solid white",
						borderRadius: "0.5rem"
					}}
				>
					<button
						onClick = {() => {setMenuOpen(!menuOpen)}}
						style={{
							top: "0rem",
							right: "0rem",
							color: "white",
							background: "black",
						}}
					>
						☰
					</button>
					
					{menuOpen && (
						<label>
							<input
								type="checkbox"
								checked={showLabels}
								onChange={() => setShowLabels(!showLabels)}
							/>
							Show labels
						</label>
					)}
				</div>
			
				<ZodiacWheel
					showLabels={showLabels}
					nodeAngles={nodeAngles}
					aspects={aspects}
				highlightedAspect={highlightedAspect}
				/>
			</div>
			
		</div>
	)
}

export default App
