import { useState, useCallback } from 'react';
import DateTimePicker from './DateTimePicker';
import { CitySelector } from './CitySelector';
import { type CityData } from './CitySearchEngine';

interface WelcomeModalProps {
	timezone: string;
	date: Date;
	onDateChange: (date: Date) => void;
	onCityChange: (city: CityData | null) => void;
	selectedCity: CityData | null;
	onProceed: () => void;
}

export default function WelcomeModal({
	timezone,
	date,
	onDateChange,
	onCityChange,
	selectedCity,
	onProceed,
}: WelcomeModalProps) {
	// The datetime always starts pre-filled with the current time.
	// To start with an empty/null datetime instead, we would need to make `date` nullable
	// (Date | null), add a "clear" button, grey out the proceed button when date is null,
	// and pass null through to App.tsx (which would require selectedDate to become Date | null - very troublesome)

	const [flash, setFlash] = useState(false);

	const handleBackdropClick = useCallback(() => {
		setFlash(true);
		setTimeout(() => setFlash(false), 500);
	}, []);

	const hasLocation = selectedCity !== null;

	return (
		<div
			className="fixed inset-0 z-[1000] flex items-center justify-center"
			onClick={handleBackdropClick}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/5 backdrop-blur-sm" />

			{/* Modal */}
			<div
				className="relative bg-theme-bg border border-theme-border p-6 w-full max-w-sm"
				style={{ borderRadius: 'var(--border-radius)' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex flex-col gap-4">

					{/* Location picker */}
					<div>
						<label className="block text-theme-text text-sm mb-1 opacity-70 hidden">Location</label>
						<CitySelector
							selectedCity={selectedCity}
							defaultString={"Enter location..."}
							onSelect={onCityChange}
						/>
					</div>
					{/* DateTime picker */}
					<div>
						<label className="block text-theme-text text-sm mb-1 opacity-70 hidden">Date & Time</label>
						<DateTimePicker
							timezone={timezone}
							value={date}
							onChange={onDateChange}
							className="w-full bg-transparent border-b border-theme-text/50 py-1 outline-none text-theme-text text-sm"
						/>
					</div>

					{/* Proceed button — aligned right */}
					<div className="flex justify-end mt-2">
						<button
							className={`border border-theme-border px-4 py-1.5 text-sm bg-transparent text-theme-text cursor-pointer hover:bg-theme-text/10 transition-colors duration-200 ${flash ? 'animate-flash' : ''}`}
							onClick={onProceed}
						>
							{hasLocation ? 'Proceed' : 'Proceed without location'}
						</button>
					</div>

					{/* Help text — bottom left */}
					<div className="text-theme-text text-xs opacity-50" style={{ fontStyle: 'italic' }}>
						Date/time and location can be modified later.
					</div>
				</div>
			</div>
		</div>
	);
}
