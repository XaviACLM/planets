import { Node } from '../defs/astroDefs.ts'

// types for orbital elements
export interface OrbitParams {
	a: number;	   // semi-major axis, AU
	e: number;	   // eccentricity
	i: number;	   // inclination, degrees
	om: number;	  // longitude of ascending node (big Omega), degrees
	w: number;	   // argument of perihelion, degrees
	ma: number;	  // mean anomaly at epoch, degrees
	epoch: number;   // epoch of the elements, in Julian Day
}

export const smallBodyParams: Partial<Record<Node, OrbitParams>> = {
	[Node.CERES]: {
		e: .07957631994408416,
		a: 2.765615651508659,
		i: 10.58788658206854,
		om: 80.24963090816965,
		w: 73.29975464616518,
		ma: 231.5397330043706,
		epoch: 2461000.5,
	},
	[Node.PALLAS]: {
		e: .2306429787781384,
		a: 2.76992582511479,
		i: 34.92832687077855,
		om: 172.8885963367437,
		w: 310.9333840114307,
		ma: 211.5297778033731,
		epoch: 2461000.5,
	},
	[Node.JUNO]: {
		e: .2558257725543152,
		a: 2.670879058906207,
		i: 12.98603961477441,
		om: 169.8198844530219,
		w: 247.8836661359693,
		ma: 217.5909617686606,
		epoch: 2461000.5,
	},
	[Node.VESTA]: {
		e: .09016764504738634,
		a: 2.361541280084789,
		i: 7.144060599543863,
		om: 103.7022980342142,
		w: 151.5371488873794,
		ma: 26.80967220901607,
		epoch: 2461000.5,
	},
	[Node.CHIRON]: {
		e: .3789792344722796,
		a: 13.69219895333959,
		i: 6.926003536945341,
		om: 209.2984204868964,
		w: 339.2537415957655,
		ma: 212.8397720525937,
		epoch: 2461000.5,
	},
	[Node.ERIS]: {
		e: .4369645738246553,
		a: 67.99635271015723,
		i: 43.86893092256593,
		om: 36.02717338514833,
		w: 150.7325674825906,
		ma: 211.4487457823031,
		epoch: 2461000.5,
	},
	[Node.MAKEMAKE]: {
		e: .1604249998705246,
		a: 45.51068182129777,
		i: 29.03230614511063,
		om: 79.26892110768972,
		w: 297.0754320412767,
		ma: 169.3202702242218,
		epoch: 2461000.5,
	},
	[Node.HAUMEA]: {
		e: .1957748188564788,
		a: 43.00549881333706,
		i: 28.20840579216805,
		om: 121.7972901946415,
		w: 240.888336259082,
		ma: 222.3276474703985,
		epoch: 2461000.5,
	},
	[Node.SEDNA]: {
		e: .8612979286929314,
		a: 549.5422816632827,
		i: 11.9259169799461,
		om: 144.4787213166509,
		w: 311.0098251025547,
		ma: 358.6072668813861,
		epoch: 2461000.5,
	},
	// even-more-minor objects
	[Node.ASTRAEA]: {
		e: .1875086167328681,
		a: 2.576864644858254,
		i: 5.359248120907933,
		om: 141.4486125162261,
		w: 359.3451688152932,
		ma: 133.8676031584658,
		epoch: 2461000.5
	},
	[Node.HYGIEA]: {
		e: .108223833089903,
		a: 3.147591335345947,
		i: 3.832937411339835,
		om: 283.1216602821771,
		w: 312.6058061800255,
		ma: 216.6903206124055,
		epoch: 2461000.5
	},
	[Node.PHOLUS]: {
		e: .574744804002886,
		a: 20.28340105547402,
		i: 24.75699076739707,
		om: 119.2896923424452,
		w: 354.7299656288133,
		ma: 134.470501527666,
		epoch: 2461000.5
	},
	[Node.NESSUS]: {
		e: .5176801039355027,
		a: 24.51657596400793,
		i: 15.64407698270027,
		om: 31.29215422788363,
		w: 170.3715103791255,
		ma: 100.5239875112597,
		epoch: 2461000.5
	},
	[Node.CHARIKLO]: {
		e: .1702459901276738,
		a: 15.73995155535189,
		i: 23.43032407033149,
		om: 300.4752379513423,
		w: 241.2242283234723,
		ma: 126.9607903541095,
		epoch: 2461000.5
	},
	[Node.HYLONOME]: {
		e: .2460826819628363,
		a: 24.94483989309537,
		i: 4.143209629199382,
		om: 178.2117200236478,
		w: 5.337085778982243,
		ma: 88.74518749658054,
		epoch: 2461000.5
	},
	[Node.CYLLARUS]: {
		e: .3773499328141605,
		a: 26.28606098834981,
		i: 12.6290949740326,
		om: 51.8523582418384,
		w: 301.8523697507526,
		ma: 96.54900239984575,
		epoch: 2461000.5
	},
	[Node.GONGGONG]: {
		e: .5031674399617051,
		a: 66.89366871435344,
		i: 30.86626129015389,
		om: 336.8400960976296,
		w: 206.6416070091921,
		ma: 111.3903730396343,
		epoch: 2461000.5
	},
	[Node.QUAOAR]: {
		e: .03583878353429052,
		a: 43.1476797802032,
		i: 7.991371294217068,
		om: 188.9632800603184,
		w: 163.9231384883233,
		ma: 291.4818844949103,
		epoch: 2461000.5
	},
	[Node.ORCUS]: {
		e: .2217300030420161,
		a: 39.33577647200568,
		i: 20.55552551599616,
		om: 268.3859416278478,
		w: 73.72249191891537,
		ma: 188.1111318293787,
		epoch: 2461000.5
	},
	[Node.SALACIA]: {
		e: .1033787261230713,
		a: 42.11465003230769,
		i: 23.92712613400163,
		om: 280.2626295339988,
		w: 309.4776964357308,
		ma: 133.4611617235804,
		epoch: 2461000.5
	},
	[Node.VARDA]: {
		e: .1430078809328084,
		a: 45.53806201400563,
		i: 21.51403329578455,
		om: 184.1214782264865,
		w: 184.9743325694585,
		ma: 276.5587616814524,
		epoch: 2461000.5
	},
	[Node.IXION]: {
		e: .2442328489971719,
		a: 39.35053706213409,
		i: 19.67041190191546,
		om: 71.09295825377649,
		w: 300.6585723831106,
		ma: 294.2004612799266,
		epoch: 2461000.5
	},
	[Node.VARUNA]: {
		e: .05254516459334936,
		a: 43.17823437208563,
		i: 17.13812404484431,
		om: 97.21030234100793,
		w: 273.2206220996139,
		ma: 115.0289798413239,
		epoch: 2461000.5
	},
	[Node.TYPHON]: {
		e: .5366891218671359,
		a: 37.70710619053339,
		i: 2.428125528641061,
		om: 351.859117537619,
		w: 158.7460728162613,
		ma: 30.40768188347683,
		epoch: 2461000.5
	},
	[Node.CHAOS]: {
		e: .1105095222990702,
		a: 46.1088785968233,
		i: 12.01969325890354,
		om: 49.90976201965729,
		w: 56.60559617826633,
		ma: 350.3822218574891,
		epoch: 2461000.5
	},
	[Node.RADAMANTHUS]: {
		e: .1568737218545504,
		a: 38.9096022938717,
		i: 12.75614054630038,
		om: 10.00333999357831,
		w: 79.82962557150879,
		ma: 113.9282838886368,
		epoch: 2461000.5
	},
	[Node.GKUNHOMDIMA]: {
		e: .4960947170808848,
		a: 74.58703052023381,
		i: 23.33294479129167,
		om: 131.2401812767421,
		w: 345.9402093274882,
		ma: 348.7467249033101,
		epoch: 2461000.5
	},
}

export const hamburgSchoolParamsNeely: Partial<Record<Node, OrbitParams>> = {
	[Node.CUPIDO]: {
		e: 0.00460,
		a: 40.99837,
		i: 1.0833,
		om: 129.8325,
		w: 171.4333,
		ma: 163.7409,
		epoch: 2415020.0,
	},
	[Node.HADES]: {
		e: 0.00245,
		a: 50.66744,
		i: 1.0500,
		om: 161.3339,
		w: 148.1796,
		ma: 27.6496,
		epoch: 2415020.0,
	},
	[Node.ZEUS]: {
		e: 0.00120,
		a: 59.21436,
		i: 0.0000,
		om: 0.0000,
		w: 299.0440,
		ma: 165.1232,
		epoch: 2415020.0,
	},
	[Node.KRONOS]: {
		e: 0.00305,
		a: 64.81960,
		i: 0.0000,
		om: 0.0000,
		w: 208.8801,
		ma: 169.0193,
		epoch: 2415020.0,
	},
	[Node.APOLLON]: {
		e: 0.00000,
		a: 70.29949,
		i: 0.0000,
		om: 0.0000,
		w: 0.0000,
		ma: 138.0533,
		epoch: 2415020.0,
	},
	[Node.ADMETOS]: {
		e: 0.00000,
		a: 73.62765,
		i: 0.0000,
		om: 0.0000,
		w: 0.0000,
		ma: 351.3350,
		epoch: 2415020.0,
	},
	[Node.VULCANUS]: {
		e: 0.00000,
		a: 77.25568,
		i: 0.0000,
		om: 0.0000,
		w: 0.0000,
		ma: 55.8983,
		epoch: 2415020.0,
	},
	[Node.POSEIDON]: {
		e: 0.00000,
		a: 83.66907,
		i: 0.0000,
		om: 0.0000,
		w: 0.0000,
		ma: 165.5163,
		epoch: 2415020.0,
	},
}

export const hamburgSchoolParamsWitte: Partial<Record<Node, OrbitParams>> = {
	[Node.CUPIDO]: {
		e: 0,
		a: 40.99837,
		i: 0,
		om: 0,
		w: 0,
		ma: 104.5959,
		epoch: 2415020.0,
	},
	[Node.HADES]: {
		e: 0,
		a: 50.667443,
		i: 0,
		om: 0,
		w: 0,
		ma: 337.4517,
		epoch: 2415020.0,
	},
	[Node.ZEUS]: {
		e: 0,
		a: 59.214362,
		i: 0,
		om: 0,
		w: 0,
		ma: 104.0904,
		epoch: 2415020.0,
	},
	[Node.KRONOS]: {
		e: 0,
		a: 64.816896,
		i: 0,
		om: 0,
		w: 0,
		ma: 17.7346,
		epoch: 2415020.0,
	},
	[Node.APOLLON]: {
		e: 0,
		a: 70.361652,
		i: 0,
		om: 0,
		w: 0,
		ma: 138.0354,
		epoch: 2415020.0,
	},
	[Node.ADMETOS]: {
		e: 0,
		a: 73.736476,
		i: 0,
		om: 0,
		w: 0,
		ma: -8.678,
		epoch: 2415020.0,
	},
	[Node.VULCANUS]: {
		e: 0,
		a: 77.445895,
		i: 0,
		om: 0,
		w: 0,
		ma: 55.9826,
		epoch: 2415020.0,
	},
	[Node.POSEIDON]: {
		e: 0,
		a: 83.493733,
		i: 0,
		om: 0,
		w: 0,
		ma: 165.3595,
		epoch: 2415020.0,
	},
}

// code below is partly from chatgpt.
// code itself only lightly checked, but results match the data from the jpl api

// helper: convert JS Date to Julian Day (UTC)
function dateToJulianDay(date: Date): number {
	const utc = Date.UTC(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate(),
		date.getUTCHours(),
		date.getUTCMinutes(),
		date.getUTCSeconds(),
		date.getUTCMilliseconds()
	);
	// Julian Day at Unix epoch (1970-01-01 00:00 UTC) is 2440587.5
	return utc / 86400000 + 2440587.5;
}

// helper: solve Kepler's equation for eccentric anomaly E
function solveKepler(M: number, e: number, tol = 1e-8): number {
	// M in radians, return E in radians
	let E = M;
	for (let iter = 0; iter < 50; ++iter) {
		const f = E - e * Math.sin(E) - M;
		const f1 = 1 - e * Math.cos(E);
		const dE = -f / f1;
		E += dE;
		if (Math.abs(dE) < tol) break;
	}
	return E;
}

export type OrbitalState = {
	x: number; y: number; z: number;
	vx: number; vy: number; vz: number;
};

// propagate elements to 3D position and velocity in heliocentric ecliptic J2000
// position in AU, velocity in AU/day
export function stateFromKepler(elems: OrbitParams, date: Date): OrbitalState {
	const { a, e, i, om, w, ma, epoch } = elems;
	const jd = dateToJulianDay(date);

	// convert degrees to radians
	const i_rad = i * Math.PI / 180;
	const om_rad = om * Math.PI / 180;
	const w_rad = w * Math.PI / 180;

	// Gaussian gravitational constant: k = 0.01720209895 AU^1.5/day
	// μ = k² AU³/day²
	const k = 0.01720209895;

	// mean motion n (rad/day), from Kepler's third law: n = sqrt(μ / a^3) = k / a^1.5
	const n = k / Math.sqrt(a * a * a);

	const dt = (jd - epoch); // days
	const M = (ma * Math.PI / 180) + n * dt;
	const M_norm = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

	const E = solveKepler(M_norm, e);

	// true anomaly ν
	const sinHalfE = Math.sin(E / 2);
	const cosHalfE = Math.cos(E / 2);
	const ν = 2 * Math.atan2(
		Math.sqrt(1 + e) * sinHalfE,
		Math.sqrt(1 - e) * cosHalfE
	);
	const sinν = Math.sin(ν);
	const cosν = Math.cos(ν);

	// distance r
	const r = a * (1 - e * Math.cos(E));

	// position in orbital plane (perihelion at ν = 0)
	const x_orb = r * cosν;
	const y_orb = r * sinν;

	// velocity in orbital plane
	// v⃗ = (μ/h)(-sin(ν), e + cos(ν), 0) where h = sqrt(μ * a * (1 - e²))
	// μ/h = k / sqrt(a * (1 - e²))
	const sqrtOneMinusE2 = Math.sqrt(1 - e * e);
	const velFactor = k / Math.sqrt(a * sqrtOneMinusE2 * sqrtOneMinusE2); // = k / sqrt(a * (1 - e²))
	const vx_orb = -velFactor * sinν;
	const vy_orb = velFactor * (e + cosν);

	// precompute trig for rotations
	const cosW = Math.cos(w_rad);
	const sinW = Math.sin(w_rad);
	const cosI = Math.cos(i_rad);
	const sinI = Math.sin(i_rad);
	const cosOm = Math.cos(om_rad);
	const sinOm = Math.sin(om_rad);

	// rotate from orbital plane to ecliptic plane:
	// 1) argument of periapsis w
	const x1 = x_orb * cosW - y_orb * sinW;
	const y1 = x_orb * sinW + y_orb * cosW;
	const vx1 = vx_orb * cosW - vy_orb * sinW;
	const vy1 = vx_orb * sinW + vy_orb * cosW;

	// 2) inclination i
	const y2 = y1 * cosI;
	const z2 = y1 * sinI;
	const vy2 = vy1 * cosI;
	const vz2 = vy1 * sinI;

	// 3) longitude of ascending node om
	const x3 = x1 * cosOm - y2 * sinOm;
	const y3 = x1 * sinOm + y2 * cosOm;
	const z3 = z2;
	const vx3 = vx1 * cosOm - vy2 * sinOm;
	const vy3 = vx1 * sinOm + vy2 * cosOm;
	const vz3 = vz2;

	return { x: x3, y: y3, z: z3, vx: vx3, vy: vy3, vz: vz3 };
}

// position-only version for callers that don't need velocity
export function positionFromKepler(elems: OrbitParams, date: Date): { x: number; y: number; z: number } {
	const state = stateFromKepler(elems, date);
	return { x: state.x, y: state.y, z: state.z };
}
