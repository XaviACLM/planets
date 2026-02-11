import { fixedStars } from './astroData.ts'
import { addPrecession } from './astronomyUtil.ts'

function computeFixedStarPositions(date: Date): Map<string, number> {
	const positions = new Map<string, number>();
	for (const [starName, j2000longitude] of Object.entries(fixedStars)){
		positions.set(starName, addPrecession(date, j2000longitude));
	}
	return positions;
}

interface FixedStarPositionsConstructorArgs {
	date: Date;
	positions?: Map<string, number>;
}

class FixedStarPositions {
	private readonly _date: Date;
	private readonly _positions: Map<string, number>;

	constructor(config: FixedStarPositionsConstructorArgs) {
		this._date = config.date;
		this._positions = config.positions ?? computeFixedStarPositions(this._date);
	}

	static create(date: Date): FixedStarPositions {
		return new FixedStarPositions({ date });
	}

	public getPositions(): Map<string, number> {
		return this._positions;
	}

	public getPosition(name: string): number {
		const pos = this._positions.get(name);
		if (pos === undefined) { throw new Error(`getPosition called for unknown star: ${name}`); }
		return pos;
	}
}

export default FixedStarPositions;
