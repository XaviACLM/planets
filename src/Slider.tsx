import './Slider.css';

interface SliderProps<T extends string> {
	options: T[];
	labels: Record<T, string>;
	value: T;
	onChange: (value: T) => void;
}

const Slider = <T extends string>({
	options,
	labels,
	value,
	onChange
}: SliderProps<T>) => {
	const currentIndex = options.indexOf(value);
	const notchCount = options.length;

	return (
		<div className="slider">
			<div className="slider-container">
				<div className="slider-track">
					{/* Active segment line */}
					{currentIndex > 0 && (
						<div 
							className="active-segment" 
						style={{ width: `${(currentIndex / (notchCount - 1)) * 100}%` }}
						/>
					)}

					{/* Notches */}
					{options.map((option, index) => (
						<button
							key={option}
							className={`slider-notch ${value === option ? 'active' : ''}`}
							style={{ left: `${(index / (notchCount - 1)) * 100}%` }}
							onClick={() => onChange(option)}
						>
							<div className="notch-indicator" />
						</button>
					))}
				</div>
			</div>

			{/* Labels */}
			<div className="slider-labels">
				{options.map(option => (
					<div 
						key={option}
						className={`slider-label ${value === option ? 'active' : ''}`}
						onClick={() => onChange(option)}
					>
						{option}
					</div>
				))}
			</div>
		</div>
	);
};

export default Slider;