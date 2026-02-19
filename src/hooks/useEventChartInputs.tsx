import { useState, useMemo, useCallback } from 'react';
import type { CityData } from '../ui/CitySearchEngine';
import type { ChartInputs } from './chartInputTypes';
import { CitySelector } from '../ui/CitySelector';
import DateTimePicker from '../ui/DateTimePicker';

export function useEventChartInputs(): ChartInputs {
	const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

	const timezone = useMemo(() => {
		if (selectedCity === null) {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		}
		return selectedCity.timezone;
	}, [selectedCity]);

	const locationPlaceholder = "Enter location...";

	const PickerBar = useCallback(() => (
		<div className="w-full bg-theme-bg border border-theme-border text-theme-text px-1">
			<CitySelector
				selectedCity={selectedCity}
				defaultString={locationPlaceholder}
				onSelect={setSelectedCity}
			/>
			<DateTimePicker
				timezone={timezone}
				value={selectedDate}
				onChange={setSelectedDate}
				className="w-full bg-transparent border-none py-1 outline-none text-theme-text text-sm"
			/>
		</div>
	), [selectedCity, timezone, selectedDate]);

	const WelcomeContent = useCallback(() => (
		<>
			<div>
				<CitySelector
					selectedCity={selectedCity}
					defaultString={locationPlaceholder}
					onSelect={setSelectedCity}
				/>
			</div>
			<div>
				<DateTimePicker
					timezone={timezone}
					value={selectedDate}
					onChange={setSelectedDate}
					className="w-full bg-transparent border-b border-theme-text/50 py-1 outline-none text-theme-text text-sm"
				/>
			</div>
		</>
	), [selectedCity, timezone, selectedDate]);

	return { selectedDate, selectedCity, timezone, PickerBar, WelcomeContent };
}
