import { useState, useEffect, useRef, useCallback } from 'react';
import Flatpickr from 'react-flatpickr';
import { toZonedTime, fromZonedTime, toISOLocal } from '../util/util';

interface DateTimePickerProps {
	timezone: string;
	value: Date;
	onChange: (date: Date) => void;
	className?: string;
}

export default function DateTimePicker({ timezone, value, onChange, className }: DateTimePickerProps) {
	// Convert UTC date to local display string in the given timezone
	const toDisplayString = useCallback((date: Date) => {
		return toISOLocal(toZonedTime(date, timezone)).slice(0, 16).replace('T', ' ');
	}, [timezone]);

	const [inputValue, setInputValue] = useState<string>(() => toDisplayString(value));

	// Draft: tracks what the user has picked in the calendar while it's open.
	// Only committed to the parent when the calendar closes.
	const draftRef = useRef<Date | null>(null);

	// Sync display when value or timezone changes externally
	useEffect(() => {
		setInputValue(toDisplayString(value));
	}, [value, timezone, toDisplayString]);

	const handleChange = (selectedDates: Date[]) => {
		if (selectedDates.length === 0) return;
		// Store the pick as a draft — don't notify the parent yet.
		// Flatpickr displays the selection visually on its own.
		draftRef.current = selectedDates[0];
	};

	const handleClose = () => {
		if (draftRef.current === null) return;
		const picked = draftRef.current;
		draftRef.current = null;
		// Commit: convert the "zoned" time back to UTC and notify the parent
		onChange(fromZonedTime(picked, timezone));
	};

	return (
		<Flatpickr
			className={className}
			value={inputValue}
			options={{
				enableTime: true,
				time_24hr: true,
				dateFormat: 'Y-m-d H:i',
				allowInput: false,
			}}
			onChange={handleChange}
			onClose={handleClose}
		/>
	);
}
