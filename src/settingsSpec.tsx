import { type FC, useId } from 'react';
import Slider from './Slider';
import NumericInputField from './NumericInputField';
import { useSettingsStore } from './settingsStore';
import { renderString } from './renderPrimitives.tsx'

// Get the state type from the store
type SettingsState = ReturnType<typeof useSettingsStore.getState>;

// Keys that are boolean values (for checkboxes)
type BooleanSettingKeys = {
	[K in keyof SettingsState]: SettingsState[K] extends boolean ? K : never
}[keyof SettingsState];

// Keys that are number values (for numeric inputs)
type NumberSettingKeys = {
	[K in keyof SettingsState]: SettingsState[K] extends number ? K : never
}[keyof SettingsState];

// Keys that are string enum values (for dropdowns, sliders, toggle buttons)
type EnumSettingKeys = {
	[K in keyof SettingsState]: SettingsState[K] extends string ? K : never
}[keyof SettingsState];

// Spec item types
export type SettingsItem =
	| { type: 'checkbox'; key: BooleanSettingKeys; label: string }
	| { type: 'dropdown'; key: EnumSettingKeys; label: string; options: readonly string[] }
	| { type: 'slider'; key: EnumSettingKeys; label: string; options: readonly string[] }
	| { type: 'toggleButtons'; key: EnumSettingKeys; label: string; options: readonly string[] }
	| { type: 'numeric'; key: NumberSettingKeys; label: string; min: number; max: number; unit: string }
	| { type: 'separator' }
	| { type: 'text'; content: string }
	| { type: 'title'; content: string };

// Helper functions to create spec items with better type inference
export const checkbox = (key: BooleanSettingKeys, label: string): SettingsItem =>
	({ type: 'checkbox', key, label });

export const dropdown = <T extends string>(key: EnumSettingKeys, label: string, options: readonly T[]): SettingsItem =>
	({ type: 'dropdown', key, label, options });

export const slider = <T extends string>(key: EnumSettingKeys, label: string, options: readonly T[]): SettingsItem =>
	({ type: 'slider', key, label, options });

export const toggleButtons = <T extends string>(key: EnumSettingKeys, label: string, options: readonly T[]): SettingsItem =>
	({ type: 'toggleButtons', key, label, options });

export const numeric = (key: NumberSettingKeys, label: string, min: number, max: number, unit: string): SettingsItem =>
	({ type: 'numeric', key, label, min, max, unit });

export const separator = (): SettingsItem => ({ type: 'separator' });

export const text = (content: string): SettingsItem => ({ type: 'text', content });

export const title = (content: string): SettingsItem => ({ type: 'title', content });

// Individual item renderers
const CheckboxItem: FC<{ stateKey: BooleanSettingKeys; label: string }> = ({ stateKey, label }) => {
	const id = useId();
	const value = useSettingsStore(s => s[stateKey] as boolean);
	const setter = useSettingsStore(s => s[`set${stateKey.charAt(0).toUpperCase()}${stateKey.slice(1)}` as keyof SettingsState] as (v: boolean) => void);

	return (
		<div className="checkbox-wrapper">
			<input
				type="checkbox"
				className="custom-checkbox"
				checked={value}
				onChange={() => setter(!value)}
				id={id}
			/>
			<label htmlFor={id}>{renderString(label)}</label>
		</div>
	);
};

const DropdownItem: FC<{ stateKey: EnumSettingKeys; label: string; options: readonly string[] }> = ({ stateKey, label, options }) => {
	const value = useSettingsStore(s => s[stateKey] as string);
	const setter = useSettingsStore(s => s[`set${stateKey.charAt(0).toUpperCase()}${stateKey.slice(1)}` as keyof SettingsState] as (v: string) => void);

	return (
		<div className="flex justify-between items-center my-1">
			<span>{renderString(label)}</span>
			<select
				value={value}
				onChange={(e) => setter(e.target.value)}
				className="bg-theme-bg text-theme-text border border-theme-text px-1 py-1 text-sm outline-none"
			>
				{options.map(option => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
};

const SliderItem: FC<{ stateKey: EnumSettingKeys; label: string; options: readonly string[] }> = ({ stateKey, label, options }) => {
	const value = useSettingsStore(s => s[stateKey] as string);
	const setter = useSettingsStore(s => s[`set${stateKey.charAt(0).toUpperCase()}${stateKey.slice(1)}` as keyof SettingsState] as (v: string) => void);

	return (
		<div>
			{label}
			<Slider
				options={options as string[]}
				value={value}
				onChange={setter}
			/>
		</div>
	);
};

const ToggleButtonsItem: FC<{ stateKey: EnumSettingKeys; label: string; options: readonly string[] }> = ({ stateKey, label, options }) => {
	const value = useSettingsStore(s => s[stateKey] as string);
	const setter = useSettingsStore(s => s[`set${stateKey.charAt(0).toUpperCase()}${stateKey.slice(1)}` as keyof SettingsState] as (v: string) => void);

	return (
		<div className="flex items-center gap-2 justify-between">
			<span>{renderString(label)}</span>
			<div className="flex gap-2">
				{options.map(option => (
					<button
						key={option}
						className={`bg-theme-bg text-sm border border-theme-border text-theme-text px-2 py-0.5 cursor-pointer transition-all hover:border-theme-border-light ${value === option ? 'border-theme-text' : ''}`}
						onClick={() => setter(option)}
					>
						{option}
					</button>
				))}
			</div>
		</div>
	);
};

const NumericItem: FC<{ stateKey: NumberSettingKeys; label: string; min: number; max: number; unit: string }> = ({ stateKey, label, min, max, unit }) => {
	const value = useSettingsStore(s => s[stateKey] as number);
	const setter = useSettingsStore(s => s[`set${stateKey.charAt(0).toUpperCase()}${stateKey.slice(1)}` as keyof SettingsState] as (v: number) => void);

	return (
		<div className="flex justify-between items-center">
			{renderString(label)}
			<div className="max-w-[50px] mr-5">
				<NumericInputField
					min={min}
					max={max}
					initialValue={value}
					onValidCommit={setter}
					placeholder=""
					unit={unit}
				/>
			</div>
		</div>
	);
};

// Main renderer component
export const SettingsRenderer: FC<{ spec: SettingsItem[] }> = ({ spec }) => {
	return (
		<div className="p-4">
			{spec.map((item, index) => {
				switch (item.type) {
					case 'checkbox':
						return <CheckboxItem key={index} stateKey={item.key} label={item.label} />;
					case 'dropdown':
						return <DropdownItem key={index} stateKey={item.key} label={item.label} options={item.options} />;
					case 'slider':
						return <SliderItem key={index} stateKey={item.key} label={item.label} options={item.options} />;
					case 'toggleButtons':
						return <ToggleButtonsItem key={index} stateKey={item.key} label={item.label} options={item.options} />;
					case 'numeric':
						return <NumericItem key={index} stateKey={item.key} label={item.label} min={item.min} max={item.max} unit={item.unit} />;
					case 'separator':
						return <hr key={index} className="opacity-50 my-2" />;
					case 'text':
						return <div key={index}>{renderString(item.content)}</div>;
					case 'title':
						return <div key={index} className="font-bold text-sm text-gray-400 tracking-wide small-caps mt-2">{item.content}</div>;
					default:
						return null;
				}
			})}
		</div>
	);
};
