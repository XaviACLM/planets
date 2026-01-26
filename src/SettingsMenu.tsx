import { FC } from 'react';
import Slider from './Slider';
import NumericInputField from './NumericInputField';
import { HouseSystem } from './houses.ts';
import { AstrologyMode } from './astroDefs.ts';
import { LunarNodeMode, HamburgSchoolMode, AspectPhysicalityFilter, AspectMenuMode, AspectErrorMode, DignityMode, HouseAngularityMode } from './settingsDefs.ts';
import { useSettingsStore } from './settingsStore.ts';

import "./SettingsMenu.css"

const SettingsMenu: FC = () => {
	// All settings from store - fine-grained subscriptions
	const selectedHouseSystem = useSettingsStore(s => s.selectedHouseSystem);
	const setSelectedHouseSystem = useSettingsStore(s => s.setSelectedHouseSystem);
	const housePresweep = useSettingsStore(s => s.housePresweep);
	const setHousePresweep = useSettingsStore(s => s.setHousePresweep);

	const showAspectLabels = useSettingsStore(s => s.showAspectLabels);
	const setShowAspectLabels = useSettingsStore(s => s.setShowAspectLabels);
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const setShowNodeLabels = useSettingsStore(s => s.setShowNodeLabels);
	const showSymbolLabels = useSettingsStore(s => s.showSymbolLabels);
	const setShowSymbolLabels = useSettingsStore(s => s.setShowSymbolLabels);
	const showElementLabels = useSettingsStore(s => s.showElementLabels);
	const setShowElementLabels = useSettingsStore(s => s.setShowElementLabels);
	const showModeLabels = useSettingsStore(s => s.showModeLabels);
	const setShowModeLabels = useSettingsStore(s => s.setShowModeLabels);
	const showSignsInDispositorChains = useSettingsStore(s => s.showSignsInRulershipPanel);
	const setShowSignsInDispositorChains = useSettingsStore(s => s.setShowSignsInDispositorChains);

	const flipText = useSettingsStore(s => s.flipText);
	const setFlipText = useSettingsStore(s => s.setFlipText);
	const rotateSymbols = useSettingsStore(s => s.rotateSymbols);
	const setRotateSymbols = useSettingsStore(s => s.setRotateSymbols);
	const aspectsColorcoded = useSettingsStore(s => s.aspectsColorcoded);
	const setAspectsColorcoded = useSettingsStore(s => s.setAspectsColorcoded);

	const selectedAspectErrorMode = useSettingsStore(s => s.selectedAspectErrorMode);
	const setSelectedAspectErrorMode = useSettingsStore(s => s.setSelectedAspectErrorMode);
	const maxConfigurationErrorDegrees = useSettingsStore(s => s.maxConfigurationErrorDegrees);
	const setMaxConfigurationErrorDegrees = useSettingsStore(s => s.setMaxConfigurationErrorDegrees);
	const maxMajorBAErrorDegrees = useSettingsStore(s => s.maxMajorBAErrorDegrees);
	const setMaxMajorBAErrorDegrees = useSettingsStore(s => s.setMaxMajorBAErrorDegrees);
	const maxMinorBAErrorDegrees = useSettingsStore(s => s.maxMinorBAErrorDegrees);
	const setMaxMinorBAErrorDegrees = useSettingsStore(s => s.setMaxMinorBAErrorDegrees);

	const aspectPhysicalityFilter = useSettingsStore(s => s.aspectPhysicalityFilter);
	const setAspectPhysicalityFilter = useSettingsStore(s => s.setAspectPhysicalityFilter);
	const hamburgPhysical = useSettingsStore(s => s.hamburgPhysical);
	const setHamburgPhysical = useSettingsStore(s => s.setHamburgPhysical);
	const selectedAspectMenuMode = useSettingsStore(s => s.selectedAspectMenuMode);
	const setSelectedAspectMenuMode = useSettingsStore(s => s.setSelectedAspectMenuMode);

	const lunarNodeMode = useSettingsStore(s => s.lunarNodeMode);
	const setLunarNodeMode = useSettingsStore(s => s.setLunarNodeMode);
	const hamburgSchoolMode = useSettingsStore(s => s.hamburgSchoolMode);
	const setHamburgSchoolMode = useSettingsStore(s => s.setHamburgSchoolMode);
	const selectedAstrologyMode = useSettingsStore(s => s.selectedAstrologyMode);
	const setSelectedAstrologyMode = useSettingsStore(s => s.setSelectedAstrologyMode);
	const selectedDignityMode = useSettingsStore(s => s.selectedDignityMode);
	const setSelectedDignityMode = useSettingsStore(s => s.setSelectedDignityMode);
	const selectedHouseAngularityMode = useSettingsStore(s => s.selectedHouseAngularityMode);
	const setSelectedHouseAngularityMode = useSettingsStore(s => s.setSelectedHouseAngularityMode);

	return (
		<div className="p-4">
			<div className="flex justify-between items-center">
				<span>House system</span>
				<select
					value={selectedHouseSystem}
					onChange={(e) => setSelectedHouseSystem(e.target.value as HouseSystem)}
					className="bg-black text-white border border-white px-1 py-1 outline-none"
				>
					{Object.values(HouseSystem).map(system => (
						<option key={system} value={system}>
							{system}
						</option>
					))}
				</select>
			</div>
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={housePresweep}
					onChange={() => setHousePresweep(!housePresweep)}
					id="pre-sweep"
				/>
				<label htmlFor="pre-sweep">House pre-sweep</label>
			</div>

			<hr className="opacity-50 my-2" />
			
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={showAspectLabels}
					onChange={() => setShowAspectLabels(!showAspectLabels)}
					id="show-aspect-labels"
				/>
				<label htmlFor="show-aspect-labels">Show aspect labels</label>
			</div>
			<br />
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={showNodeLabels}
					onChange={() => setShowNodeLabels(!showNodeLabels)}
					id="show-node-labels"
				/>
				<label htmlFor="show-node-labels">Show node labels</label>
			</div>
			<br />
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={showSymbolLabels}
					onChange={() => setShowSymbolLabels(!showSymbolLabels)}
					id="show-symbol-labels"
				/>
				<label htmlFor="show-symbol-labels">Show zodiac symbol labels</label>
			</div>
			<br />
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={showElementLabels}
					onChange={() => setShowElementLabels(!showElementLabels)}
					id="show-element-labels"
				/>
				<label htmlFor="show-element-labels">Show element labels</label>
			</div>
			<br />
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={showModeLabels}
					onChange={() => setShowModeLabels(!showModeLabels)}
					id="show-mode-labels"
				/>
				<label htmlFor="show-mode-labels">Show mode labels</label>
			</div>

			<hr className="opacity-50 my-2" />

			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={flipText}
					onChange={() => setFlipText(!flipText)}
					id="flip-text"
				/>
				<label htmlFor="flip-text">Keep text right-side-up</label>
			</div>
			<br />
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={rotateSymbols}
					onChange={() => setRotateSymbols(!rotateSymbols)}
					id="rotate-symbols"
				/>
				<label htmlFor="rotate-symbols">Rotate symbols</label>
			</div>
			<br />
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={aspectsColorcoded}
					onChange={() => setAspectsColorcoded(!aspectsColorcoded)}
					id="aspects-colorcoded"
				/>
				<label htmlFor="aspects-colorcoded">Colorcode aspects</label>
			</div>
			<br />
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={showSignsInDispositorChains}
					onChange={() => setShowSignsInDispositorChains(!showSignsInDispositorChains)}
					id="show-signs-in-rulership"
				/>
				<label htmlFor="show-signs-in-rulership">Show signs in dispositor chains</label>
			</div>

			<hr className="opacity-50 my-2" />

			<div className="flex justify-between items-center">
				<span>Configuration error</span>
				<select
					value={selectedAspectErrorMode}
					onChange={(e) => setSelectedAspectErrorMode(e.target.value as AspectErrorMode)}
					className="bg-black text-white border border-white px-1 py-1 outline-none"
				>
					{Object.values(AspectErrorMode).map(system => (
						<option key={system} value={system}>
							{system}
						</option>
					))}
				</select>
			</div>
			Maximum error per aspect type:
			<div className="flex justify-between items-center">
				- Configurations:
				<div className="max-w-[50px] mr-5">
					<NumericInputField
						min={0}
						max={20}
						initialValue={maxConfigurationErrorDegrees}
						onValidCommit={setMaxConfigurationErrorDegrees}
						placeholder="Error"
						unit={"º"}
					/>
				</div>
			</div>
			<div className="flex justify-between items-center">
				- Major binary aspects:
				<div className="max-w-[50px] mr-5">
					<NumericInputField
						min={0}
						max={20}
						initialValue={maxMajorBAErrorDegrees}
						onValidCommit={setMaxMajorBAErrorDegrees}
						placeholder="Error"
						unit={"º"}
					/>
				</div>
			</div>
			<div className="flex justify-between items-center">
				- Minor binary aspects:
				<div className="max-w-[50px] mr-5">
					<NumericInputField
						min={0}
						max={20}
						initialValue={maxMinorBAErrorDegrees}
						onValidCommit={setMaxMinorBAErrorDegrees}
						placeholder="Error"
						unit={"º"}
					/>
				</div>
			</div>

			<hr className="opacity-50 my-2" />

			Required # of physical nodes per aspect:
			<Slider
				options={Object.values(AspectPhysicalityFilter)}
				value={aspectPhysicalityFilter}
				onChange={setAspectPhysicalityFilter}
			/>
			<br />
			<div className="checkbox-wrapper">
				<input
					type="checkbox"
					className="custom-checkbox"
					checked={hamburgPhysical}
					onChange={() => setHamburgPhysical(!hamburgPhysical)}
					id="hamburg-physical"
				/>
				<label htmlFor="hamburg-physical">Hamburg objects considered physical</label>
			</div>
			<div className="flex justify-between items-center">
				<span>Display aspects</span>
				<select
					value={selectedAspectMenuMode}
					onChange={(e) => setSelectedAspectMenuMode(e.target.value as AspectMenuMode)}
					className="bg-black text-white border border-white px-1 py-1 outline-none"
				>
					{Object.values(AspectMenuMode).map(system => (
						<option key={system} value={system}>
							{system}
						</option>
					))}
				</select>
			</div>

			<hr className="opacity-50 my-2" />

			<div className="flex items-center gap-2 justify-between">
				<span>Lunar node mode:</span>
				<div className="flex gap-2">
					<button
						className={`bg-black border border-gray-700 text-white px-2 py-0.5 cursor-pointer transition-all hover:border-gray-500 ${lunarNodeMode === LunarNodeMode.MEAN ? 'border-white' : ''}`}
						onClick={() => setLunarNodeMode(LunarNodeMode.MEAN)}
					>
						Mean
					</button>
					<button
						className={`bg-black border border-gray-700 text-white px-2 py-0.5 cursor-pointer transition-all hover:border-gray-500 ${lunarNodeMode === LunarNodeMode.TRUE ? 'border-white' : ''}`}
						onClick={() => setLunarNodeMode(LunarNodeMode.TRUE)}
					>
						True
					</button>
				</div>
			</div>
			
			<hr className="opacity-50 my-2" />
			
			<div className="flex items-center gap-2">
				<span>Hamburg school params:</span>
				<div className="flex gap-2">
					<button
						className={`bg-black border border-gray-700 text-white px-2 py-0.5 cursor-pointer transition-all hover:border-gray-500 ${hamburgSchoolMode === HamburgSchoolMode.WITTE ? 'border-white' : ''}`}
						onClick={() => setHamburgSchoolMode(HamburgSchoolMode.WITTE)}
					>
						Witte
					</button>
					<button
						className={`bg-black border border-gray-700 text-white px-2 py-0.5 cursor-pointer transition-all hover:border-gray-500 ${hamburgSchoolMode === HamburgSchoolMode.NEELY ? 'border-white' : ''}`}
						onClick={() => setHamburgSchoolMode(HamburgSchoolMode.NEELY)}
					>
						Neely
					</button>
				</div>
			</div>
			
			<hr className="opacity-50 my-2" />
			
			<div className="flex justify-between items-center">
				<span>Mode</span>
				<select
					value={selectedAstrologyMode}
					onChange={(e) => setSelectedAstrologyMode(e.target.value as AstrologyMode)}
					className="bg-black text-white border border-white px-1 py-1 outline-none"
				>
					{Object.values(AstrologyMode).map(system => (
						<option key={system} value={system}>
							{system}
						</option>
					))}
				</select>
			</div>
			
			<hr className="opacity-50 my-2" />
			
			<div className="flex justify-between items-center">
				<span>Dignities</span>
				<select
					value={selectedDignityMode}
					onChange={(e) => setSelectedDignityMode(e.target.value as DignityMode)}
					className="bg-black text-white border border-white px-1 py-1 outline-none"
				>
					{Object.values(DignityMode).map(mode => (
						<option key={mode} value={mode}>
							{mode}
						</option>
					))}
				</select>
			</div>
			
			<hr className="opacity-50 my-2" />
			
			<div className="flex justify-between items-center">
				<span>House angularity</span>
				<select
					value={selectedHouseAngularityMode}
					onChange={(e) => setSelectedHouseAngularityMode(e.target.value as HouseAngularityMode)}
					className="bg-black text-white border border-white px-1 py-1 outline-none"
				>
					{Object.values(HouseAngularityMode).map(mode => (
						<option key={mode} value={mode}>
							{mode}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default SettingsMenu;
