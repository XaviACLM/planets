import { type FC } from 'react';
import { HouseSystem } from './houses.ts';
import { AstrologyMode } from './astroDefs.ts';
import {
	LunarNodeMode,
	HamburgSchoolMode,
	AspectPhysicalityFilter,
	AspectMenuMode,
	AspectErrorMode,
	DignityMode,
	HouseAngularityMode,
	TriplicityMode,
	FaceMode,
	BoundsMode
} from './settingsDefs.ts';
import {
	SettingsRenderer,
	type SettingsItem,
	checkbox,
	dropdown,
	slider,
	toggleButtons,
	numeric,
	separator,
	text,
} from './settingsSpec';

import './SettingsMenu.css';

// ============================================================================
// Main Settings Menu
// ============================================================================

const mainSettingsSpec: SettingsItem[] = [
	// House settings
	dropdown('houseSystem', 'House system', Object.values(HouseSystem)),
	checkbox('housePresweep', 'House pre-sweep'),

	separator(),

	// Label visibility
	checkbox('showAspectLabels', 'Show aspect labels'),
	checkbox('showNodeLabels', 'Show node labels'),
	checkbox('showSymbolLabels', 'Show zodiac symbol labels'),
	checkbox('showElementLabels', 'Show element labels'),
	checkbox('showModeLabels', 'Show mode labels'),

	separator(),

	// Display options
	checkbox('flipText', 'Keep text right-side-up'),
	checkbox('rotateSymbols', 'Rotate symbols'),
	checkbox('aspectsColorcoded', 'Colorcode aspects'),
	checkbox('showSignsInDispositorChains', 'Show signs in dispositor chains'),

	separator(),

	// Aspect error settings
	dropdown('aspectErrorMode', 'Configuration error', Object.values(AspectErrorMode)),
	text('Maximum error per aspect type:'),
	numeric('maxConfigurationErrorDegrees', '- Configurations:', 0, 20, 'º'),
	numeric('maxMajorBAErrorDegrees', '- Major binary aspects:', 0, 20, 'º'),
	numeric('maxMinorBAErrorDegrees', '- Minor binary aspects:', 0, 20, 'º'),

	separator(),

	// Aspect filtering
	text('Required # of physical nodes per aspect:'),
	slider('aspectPhysicalityFilter', '', Object.values(AspectPhysicalityFilter)),
	checkbox('hamburgPhysical', 'Hamburg objects considered physical'),
	dropdown('aspectMenuMode', 'Display aspects', Object.values(AspectMenuMode)),

	separator(),

	// Lunar node mode
	toggleButtons('lunarNodeMode', 'Lunar node mode:', Object.values(LunarNodeMode)),

	separator(),

	// Hamburg school
	toggleButtons('hamburgSchoolMode', 'Hamburg school params:', Object.values(HamburgSchoolMode)),

	separator(),

	// Astrology mode
	dropdown('astrologyMode', 'Mode', Object.values(AstrologyMode)),

	separator(),

	// Dignities
	dropdown('dignityMode', 'Dignities', Object.values(DignityMode)),
	checkbox('useExtendedDignities', 'Use extended dignities'),
	dropdown('triplicityMode', 'Triplicity', Object.values(TriplicityMode)),
	dropdown('boundsMode', 'Bounds', Object.values(BoundsMode)),
	dropdown('faceMode', 'Faces', Object.values(FaceMode)),

	separator(),

	// House angularity
	dropdown('houseAngularityMode', 'House angularity', Object.values(HouseAngularityMode)),
];

export const MainSettingsMenu: FC = () => {
	return <SettingsRenderer spec={mainSettingsSpec} />;
};

// ============================================================================
// Module Settings Menus
// ============================================================================

// Element/Mode Balance (Dominance Chart) settings
const dominanceSettingsSpec: SettingsItem[] = [
	checkbox('showNodeLabels', 'Show node labels'),
	checkbox('showElementLabels', 'Show element labels'),
	checkbox('showModeLabels', 'Show mode labels'),
	separator(),
	dropdown('astrologyMode', 'Mode', Object.values(AstrologyMode)),
];

export const DominanceSettingsMenu: FC = () => {
	return <SettingsRenderer spec={dominanceSettingsSpec} />;
};

// Orientation (Hemispheres) settings
const hemisphereSettingsSpec: SettingsItem[] = [
	checkbox('showNodeLabels', 'Show node labels'),
];

export const HemisphereSettingsMenu: FC = () => {
	return <SettingsRenderer spec={hemisphereSettingsSpec} />;
};

// Rulership Graph settings
const rulershipSettingsSpec: SettingsItem[] = [
	dropdown('dignityMode', 'Dignities', Object.values(DignityMode)),
	separator(),
	checkbox('showNodeLabels', 'Show node labels'),
	checkbox('showSymbolLabels', 'Show zodiac symbol labels'),
	checkbox('showSignsInDispositorChains', 'Show signs in dispositor chains'),
	separator(),
	dropdown('astrologyMode', 'Mode', Object.values(AstrologyMode)),
];

export const RulershipSettingsMenu: FC = () => {
	return <SettingsRenderer spec={rulershipSettingsSpec} />;
};

// Planet Panel settings
const planetSettingsSpec: SettingsItem[] = [
	checkbox('useExtendedDignities', 'Use extended dignities'),

	separator(),

	// Label visibility
	checkbox('showNodeLabels', 'Show node labels'),
	checkbox('showSymbolLabels', 'Show zodiac symbol labels'),
	checkbox('showSignsInDispositorChains', 'Show signs in dispositor chains'),

	separator(),

	// Dignities
	dropdown('dignityMode', 'Dignities', Object.values(DignityMode)),
	dropdown('triplicityMode', 'Triplicity', Object.values(TriplicityMode)),
	dropdown('boundsMode', 'Bounds', Object.values(BoundsMode)),
	dropdown('faceMode', 'Faces', Object.values(FaceMode)),

	separator(),

	// House angularity
	dropdown('houseAngularityMode', 'House angularity', Object.values(HouseAngularityMode)),
];

export const PlanetSettingsMenu: FC = () => {
	return <SettingsRenderer spec={planetSettingsSpec} />;
};
