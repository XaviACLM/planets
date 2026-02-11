import { normalizeAngleRad } from './util.ts'
import { AstrologyMode, Zodiac, standardZodiac, irregularAstrologyModes } from './astroDefs.ts'
import { ayanamsas, zodiacLongitudeClosest, zodiacLongitudeIAU } from './astroData.ts'
import { addPrecession } from './astronomyUtil.ts'

function computeSiderealOffset(date: Date, astrologyMode: AstrologyMode): number {
	if (astrologyMode === AstrologyMode.TROPICAL) { return 0; }

	const ayanamsaJ2000 = ayanamsas[astrologyMode];
	if (ayanamsaJ2000 === undefined) {
		throw new Error("Irregular astrology mode passed to computeSiderealOffset");
	}

	return addPrecession(date, ayanamsaJ2000*Math.PI/180);
}

function computeSignPositionsFromSiderealOffset(siderealOffset: number): Map<Zodiac, number> {
	return new Map(standardZodiac.map((zodiac, index) =>
		[zodiac, siderealOffset + index * Math.PI / 6]
	));
}

function computeSignPositionsForIrregularMode(date: Date, astrologyMode: AstrologyMode): Map<Zodiac, number> {
	let zodiacLongitudes = null;

	if (astrologyMode === AstrologyMode.CONSTELLATIONS_CLOSEST) {
		zodiacLongitudes = zodiacLongitudeClosest;
	} else if (astrologyMode === AstrologyMode.CONSTELLATIONS_IAU) {
		zodiacLongitudes = zodiacLongitudeIAU;
	} else {
		throw new Error("Regular astrology mode passed to computeSignPositionsForIrregularMode");
	}

	return new Map(
		Object.entries(zodiacLongitudes).map(([zodiac, lon]) =>
			[zodiac, addPrecession(date, lon)]
		)
	);
}

interface ZodiacSignPositionsConstructorArgs {
	date: Date;
	zodiacMode: AstrologyMode;
	siderealOffset?: number | null;
	signPositions?: Map<Zodiac, number>;
}

class ZodiacSignPositions {
	private readonly _date: Date;
	private readonly _zodiacMode: AstrologyMode;
	private readonly _signPositions: Map<Zodiac, number>;
	public readonly siderealOffset: number | null;

	constructor(config: ZodiacSignPositionsConstructorArgs) {
		this._date = config.date;
		this._zodiacMode = config.zodiacMode;

		if (config.siderealOffset === undefined) {
			if (irregularAstrologyModes.includes(this._zodiacMode)) {
				this.siderealOffset = null;
			} else {
				this.siderealOffset = computeSiderealOffset(this._date, this._zodiacMode);
			}
		} else {
			this.siderealOffset = config.siderealOffset;
		}

		if (config.signPositions !== undefined) {
			this._signPositions = config.signPositions;
		} else if (this.siderealOffset === null) {
			this._signPositions = computeSignPositionsForIrregularMode(this._date, this._zodiacMode);
		} else {
			this._signPositions = computeSignPositionsFromSiderealOffset(this.siderealOffset);
		}
	}

	static create(date: Date, zodiacMode: AstrologyMode): ZodiacSignPositions {
		return new ZodiacSignPositions({ date, zodiacMode });
	}

	public getSignPositions(): Map<Zodiac, number> {
		return this._signPositions;
	}

	public isRegular(): boolean {
		return this.siderealOffset !== null;
	}

	public getSignAtLongitude(lon: number): Zodiac {
		if (this.isRegular()) {
			return standardZodiac[Math.floor((((lon-this.siderealOffset)*6/Math.PI)%12+12)%12)];
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
			return normalizeAngleRad(lon - this.siderealOffset)%(Math.PI/6);
		} else {
			const sign = this.getSignAtLongitude(lon);
			return lon - this._signPositions.get(sign);
		}
	}
}

export default ZodiacSignPositions;
