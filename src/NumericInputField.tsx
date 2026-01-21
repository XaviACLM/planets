import { useState, useCallback, type ChangeEvent, type KeyboardEvent, type FocusEvent, type FC } from 'react';

interface NumericInputFieldProps {
	min: number;
	max: number;
	onValidCommit: (value: number) => void;
	initialValue: number;
	placeholder: string;
	unit: string;
}

const NumericInputField: FC<NumericInputFieldProps> = ({
	min,
	max,
	onValidCommit,
	initialValue,
	placeholder,
	unit
}) => {
	const [inputValue, setInputValue] = useState<string>(String(initialValue)+unit);
	const [hasError, setHasError] = useState<boolean>(false);
	const [lastValidValue, setLastValidValue] = useState<number>(initialValue);

	const validateAndCommit = useCallback((textValue: string) => {
		// only works for single character units, careful
		const endsWithUnit = textValue[textValue.length-1] == unit;
		const parsedNumber = endsWithUnit ? parseFloat(textValue.slice(0,-1)) : parseFloat(textValue);
		const isNumeric = !isNaN(parsedNumber);
		const isWithinBounds = parsedNumber >= min && parsedNumber <= max;
		const isValid = isNumeric && isWithinBounds;

		if (isValid) {
			setHasError(false);
			// Clean up the input string to the parsed number's string representation
			setInputValue(String(parsedNumber)+unit);
			if ( parsedNumber != lastValidValue) {
				setLastValidValue(parsedNumber);
				onValidCommit(parsedNumber);
			}
		} else {
			setHasError(true);
		}
	}, [min, max, onValidCommit, lastValidValue]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
		setHasError(false); // Clear error immediately on user typing
	};

	const handleCommit = (event: FocusEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>) => {
		// Check if the trigger was 'Enter' key press
		const isEnterKey = 'key' in event && event.key === 'Enter';

		// Trigger validation on Blur (FocusEvent) or Enter key press (KeyboardEvent)
		if ('type' in event && event.type === 'blur' || isEnterKey) {
			validateAndCommit(inputValue);
			if (isEnterKey) {
				// If Enter was pressed, manually trigger blur to finalize the input appearance
				(event.target as HTMLInputElement).blur();
			}
		}
	};

	return (
		<input
			type="text"
			className={`w-full bg-transparent border-b py-1 outline-none text-white text-sm font-normal transition-colors box-border ${
				hasError ? 'border-red-500' : 'border-white'
			}`}
			value={inputValue}
			onChange={handleChange}
			onKeyDown={handleCommit} // Check for Enter key press
			onBlur={handleCommit}    // Check for loss of focus
			placeholder={placeholder}
			aria-invalid={hasError}
		/>
	);
};

export default NumericInputField;
