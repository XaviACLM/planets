import { renderString } from './renderPrimitives.tsx'

interface SliderProps<T extends string> {
	options: T[];
	value: T;
	onChange: (value: T) => void;
}

const Slider = <T extends string>({
	options,
	value,
	onChange
}: SliderProps<T>) => {
	const currentIndex = options.indexOf(value);
	const notchCount = options.length;

	return (
		<div className="w-full py-2">
			<div className="relative px-2.5">
				{/*halfway color*/}
				<div className="relative h-0.5 bg-theme-text/30">
					{/* Active segment line */}
					{currentIndex > 0 && (
						<div
							className="absolute h-0.5 bg-theme-text left-0 top-0 transition-[width] duration-200"
							style={{ width: `${(currentIndex / (notchCount - 1)) * 100}%` }}
						/>
					)}

					{/* Notches */}
					{options.map((option, index) => (
						<button
							key={option}
							className="group absolute bg-transparent border-none p-3 cursor-pointer -translate-x-1/2 top-1/2 -mt-3 -translate-y-1"
							style={{ left: `${(index / (notchCount - 1)) * 100}%` }}
							onClick={() => onChange(option)}
						>
							<div
								className={`transition-all duration-200 ${
									value === option
										? 'w-2.5 h-2.5 bg-theme-text'
										: 'w-2 h-2 bg-theme-text/30 group-hover:bg-theme-text/60'
								}`}
							/>
						</button>
					))}
				</div>
			</div>

			{/* Labels */}
			<div className="flex justify-between mt-2">
				{options.map(option => (
					<div
						key={option}
						className={`cursor-pointer text-center flex-1 select-none px-0.5 py-1 transition-colors duration-200 ${
							value === option
								? 'text-theme-text font-medium'
								: 'text-theme-text/50 hover:text-theme-text'
						}`}
						onClick={() => onChange(option)}
					>
						{renderString(option)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Slider;
