import { FC } from 'react';
import Slider from './Slider';
import NumericInputField from './NumericInputField';
import { HouseSystem } from './houses.ts';
import { LunarNodeMode, AstrologyMode, HamburgSchoolMode, AspectPhysicalityFilter, AspectMenuMode, AspectErrorMode, RulershipMode } from './astroDefs.ts';
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
	const showSignsInRulershipPanel = useSettingsStore(s => s.showSignsInRulershipPanel);
	const setShowSignsInRulershipPanel = useSettingsStore(s => s.setShowSignsInRulershipPanel);

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
	const selectedRulershipMode = useSettingsStore(s => s.selectedRulershipMode);
	const setSelectedRulershipMode = useSettingsStore(s => s.setSelectedRulershipMode);

	const selectStyle = {
		backgroundColor: "black",
		color: "white",
		border: "1px solid white",
		padding: "8px 12px",
		borderRadius: "4px",
		outline: "none",
	};

	return (
		<div style={{ padding: "1rem" }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span>House system</span>
				<select
					value={selectedHouseSystem}
					onChange={(e) => setSelectedHouseSystem(e.target.value as HouseSystem)}
					style={selectStyle}
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
			<hr style={{ opacity: 0.5 }} />
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

			<hr style={{ opacity: 0.5 }} />

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
					checked={showSignsInRulershipPanel}
					onChange={() => setShowSignsInRulershipPanel(!showSignsInRulershipPanel)}
					id="show-signs-in-rulership"
				/>
				<label htmlFor="show-signs-in-rulership">Show signs in rulership panel</label>
			</div>

			<hr style={{ opacity: 0.5 }} />

			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span>Configuration error</span>
				<select
					value={selectedAspectErrorMode}
					onChange={(e) => setSelectedAspectErrorMode(e.target.value as AspectErrorMode)}
					style={selectStyle}
				>
					{Object.values(AspectErrorMode).map(system => (
						<option key={system} value={system}>
							{system}
						</option>
					))}
				</select>
			</div>
			Maximum error per aspect type:
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				- Configurations:
				<div style={{ maxWidth: '50px' }}>
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
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				- Major binary aspects:
				<div style={{ maxWidth: '50px' }}>
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
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				- Minor binary aspects:
				<div style={{ maxWidth: '50px' }}>
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

			<hr style={{ opacity: 0.5 }} />

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
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span>Display aspects</span>
				<select
					value={selectedAspectMenuMode}
					onChange={(e) => setSelectedAspectMenuMode(e.target.value as AspectMenuMode)}
					style={selectStyle}
				>
					{Object.values(AspectMenuMode).map(system => (
						<option key={system} value={system}>
							{system}
						</option>
					))}
				</select>
			</div>

			<hr style={{ opacity: 0.5 }} />

			<div className="toggle-switch">
				<span>Lunar node mode:</span>
				<button
					className={`toggle-option ${lunarNodeMode === LunarNodeMode.MEAN ? 'active' : ''}`}
					onClick={() => setLunarNodeMode(LunarNodeMode.MEAN)}
				>
					Mean
				</button>
				<button
					className={`toggle-option ${lunarNodeMode === LunarNodeMode.TRUE ? 'active' : ''}`}
					onClick={() => setLunarNodeMode(LunarNodeMode.TRUE)}
				>
					True
				</button>
			</div>
			<hr style={{ opacity: 0.5 }} />
			<div className="toggle-switch">
				<span>Hamburg school params:</span>
				<button
					className={`toggle-option ${hamburgSchoolMode === HamburgSchoolMode.WITTE ? 'active' : ''}`}
					onClick={() => setHamburgSchoolMode(HamburgSchoolMode.WITTE)}
				>
					Witte
				</button>
				<button
					className={`toggle-option ${hamburgSchoolMode === HamburgSchoolMode.NEELY ? 'active' : ''}`}
					onClick={() => setHamburgSchoolMode(HamburgSchoolMode.NEELY)}
				>
					Neely
				</button>
			</div>
			<hr style={{ opacity: 0.5 }} />
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span>Mode</span>
				<select
					value={selectedAstrologyMode}
					onChange={(e) => setSelectedAstrologyMode(e.target.value as AstrologyMode)}
					style={selectStyle}
				>
					{Object.values(AstrologyMode).map(system => (
						<option key={system} value={system}>
							{system}
						</option>
					))}
				</select>
			</div>
			<hr style={{ opacity: 0.5 }} />
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span>Rulerships</span>
				<select
					value={selectedRulershipMode}
					onChange={(e) => setSelectedRulershipMode(e.target.value as RulershipMode)}
					style={selectStyle}
				>
					{Object.values(RulershipMode).map(mode => (
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
