import { normalizeAngleRad } from './util.ts'
import { ZodiacMode, Zodiac, standardZodiac, irregularZodiacModes } from './astroDefs.ts'
import { ayanamsas, zodiacLongitudeClosest, zodiacLongitudeIAU } from './astroData.ts'
import { addPrecession } from './astronomyUtil.ts'

function computeSiderealOffset(date: Date, zodiacMode: ZodiacMode): number {
	if (zodiacMode === ZodiacMode.TROPICAL) { return 0; }

	const ayanamsaJ2000 = ayanamsas[zodiacMode];
	if (ayanamsaJ2000 === undefined) {
		throw new Error("Irregular zodiac mode passed to computeSiderealOffset");
	}

	return addPrecession(date, ayanamsaJ2000*Math.PI/180);
}

function computeSignPositionsFromSiderealOffset(siderealOffset: number): Map<Zodiac, number> {
	return new Map(standardZodiac.map((zodiac, index) =>
		[zodiac, siderealOffset + index * Math.PI / 6]
	));
}

function computeSignPositionsForIrregularMode(date: Date, zodiacMode: ZodiacMode): Map<Zodiac, number> {
	let zodiacLongitudes = null;

	if (zodiacMode === ZodiacMode.CONSTELLATIONS_CLOSEST) {
		zodiacLongitudes = zodiacLongitudeClosest;
	} else if (zodiacMode === ZodiacMode.CONSTELLATIONS_IAU) {
		zodiacLongitudes = zodiacLongitudeIAU;
	} else {
		throw new Error("Regular zodiac mode passed to computeSignPositionsForIrregularMode");
	}

	return new Map(
		Object.entries(zodiacLongitudes).map(([zodiac, lon]) =>
			[zodiac as Zodiac, addPrecession(date, lon)]
		)
	);
}

interface ZodiacSignPositionsConstructorArgs {
	date: Date;
	zodiacMode: ZodiacMode;
	siderealOffset: number | null;
	signPositions: Map<Zodiac, number>;
}

class ZodiacSignPositions {
	// dependencies
	private readonly _date: Date;
	private readonly _zodiacMode: ZodiacMode;
	
	// logical state
	public readonly siderealOffset: number | null;
	private readonly _signPositions: Map<Zodiac, number>;

	constructor(config: ZodiacSignPositionsConstructorArgs) {
		this._date = config.date;
		this._zodiacMode = config.zodiacMode;
		this.siderealOffset = config.siderealOffset;
		this._signPositions = config.signPositions;
	}

	static create(date: Date, zodiacMode: ZodiacMode): ZodiacSignPositions {
		const isIrregular = irregularZodiacModes.includes(zodiacMode);
		const siderealOffset = isIrregular ? null : computeSiderealOffset(date, zodiacMode);
		const signPositions = isIrregular
			? computeSignPositionsForIrregularMode(date, zodiacMode)
			: computeSignPositionsFromSiderealOffset(siderealOffset);
		return new ZodiacSignPositions({ date, zodiacMode, siderealOffset, signPositions });
	}

	public getSignPositions(): Map<Zodiac, number> {
		return this._signPositions;
	}

	public isRegular(): boolean {
		return this.siderealOffset !== null;
	}

	public getSignAtLongitude(lon: number): Zodiac {
		if (this.isRegular()) {
			return standardZodiac[Math.floor((((lon-this.siderealOffset!)*6/Math.PI)%12+12)%12)];
		} else {
			const entries = Array.from(this._signPositions.entries());
			const index = entries.findIndex(([_, zlon]) => zlon > lon);
			if (index === -1 || index === 0) {
				return entries[entries.length - 1][0];
			} else {
				return entries[index - 1][0];
			}
		}
	}

	public getPositionWithinSign(lon: number): number {
		if (this.isRegular()) {
			return normalizeAngleRad(lon - this.siderealOffset!)%(Math.PI/6);
		} else {
			const sign = this.getSignAtLongitude(lon);
			return lon - this._signPositions.get(sign)!;
		}
	}
}

export default ZodiacSignPositions;
