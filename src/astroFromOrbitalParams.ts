import { Node } from './astroDefs.ts'

// types for orbital elements
interface OrbitParams {
  a: number;       // semi-major axis, AU
  e: number;       // eccentricity
  i: number;       // inclination, degrees
  om: number;      // longitude of ascending node (big Omega), degrees
  w: number;       // argument of perihelion, degrees
  ma: number;      // mean anomaly at epoch, degrees
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
}

export const HamburgSchoolMode = {
	WITTE: "Witte/Sieggrün",
	NEELY: "Neely",
} as const;
export type HamburgSchoolMode = typeof HamburgSchoolMode[keyof typeof HamburgSchoolMode];

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
    [Node.VULKANUS]: {
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

// propagate elements to 3D position in heliocentric ecliptic (J2000)
function positionFromKepler(
  elems: OrbitParams,
  targetJD: number
): { x: number; y: number; z: number } {
  const { a, e, i, om, w, ma, epoch } = elems;

  // convert degrees to radians
  const i_rad = i * Math.PI / 180;
  const om_rad = om * Math.PI / 180;
  const w_rad = w * Math.PI / 180;

  // mean motion n (rad/day), from Kepler's third law: n = sqrt(μ / a^3)
  // For Solar System, μ ≈ k^2, where k = Gaussian gravitational constant = 0.01720209895 AU^1.5/day
  const k = 0.01720209895;
  const n = k / Math.sqrt(a * a * a);

  const dt = (targetJD - epoch); // days
  const M = (ma * Math.PI / 180) + n * dt;
  const M_norm = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  const E = solveKepler(M_norm, e);

  // true anomaly ν
  const ν = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );

  // distance r
  const r = a * (1 - e * Math.cos(E));

  // position in orbital plane (perihelion at ν = 0)
  const x_orb = r * Math.cos(ν);
  const y_orb = r * Math.sin(ν);

  // now rotate from orbital plane to ecliptic plane:
  // 1) argument of periapsis w
  const x1 = x_orb * Math.cos(w_rad) - y_orb * Math.sin(w_rad);
  const y1 = x_orb * Math.sin(w_rad) + y_orb * Math.cos(w_rad);
  // 2) inclination i
  const z2 = y1 * Math.sin(i_rad);
  const y2 = y1 * Math.cos(i_rad);
  // 3) longitude of ascending node om
  const x3 = x1 * Math.cos(om_rad) - y2 * Math.sin(om_rad);
  const y3 = x1 * Math.sin(om_rad) + y2 * Math.cos(om_rad);
  const z3 = z2;

  return { x: x3, y: y3, z: z3 };
}

// convert cartesian to spherical ecliptic longitude (degrees)
function eclipticLongitudeFromPosition(pos: { x: number; y: number; z: number }): number {
  const { x, y } = pos;
  let lon = Math.atan2(y, x) * 180 / Math.PI;
  if (lon < 0) lon += 360;
  return lon;
}

// main function: elements + date → ecliptic longitude
export function orbitalLongitude(
  elems: OrbitParams,
  date: Date
): number {
  // convert JS Date to Julian Day
  const jd = dateToJulianDay(date);
  const pos = positionFromKepler(elems, jd);
  const lon = eclipticLongitudeFromPosition(pos);
  return lon;
}

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
