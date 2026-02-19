import { type FC } from 'react';

const P: FC<{ children: React.ReactNode }> = ({ children }) => (
	<p className="mb-2">{children}</p>
);

// ============================================================================
// Module Help Content
// ============================================================================

export const PlanetInfoHelp: FC = () => (
	<>
		<P>
			This panel displays detailed information for a single selected node.
		</P>
		<P>
			<b>Node Selection.</b> Nodes may be selected by clicking on them in the main chart. One can also cycle nodes (ordered by ecliptic longitude) with the two arrow buttons on top of this panel.
		</P>
		<P>
			<b>Node Data.</b> Displays sign, degree, house placement, angularity, dignity, motion, sect status, closeness to main angles, and aspects where applicable. Some fields appear only when relevant to the selected node.
		</P>
		<P>
			<b>Extended Dignities.</b> When enabled in settings, additional dignity information (triplicity, bounds, face) is displayed using the selected source conventions.
		</P>
		<P>
			<b>Dispositorship.</b> Shows the dispositorship chain starting at the selected node, including final dispositor(s), along with the nodes it rules directly and transitively.
		</P>
	</>
);

export const DominanceChartHelp: FC = () => (
	<>
		<P>
			This panel summarizes elemental and modal distributions in the chart. It can be in summary or expanded mode, toggled by the arrows in the top right corner.
		</P>
		<P>
			<b>Summary Mode.</b> Reports overall element and mode dominance across all nodes, making particular note of luminaries and main angles.
		</P>
		<P>
			<b>Expanded Mode.</b> Segregates the overall analysis into the personal, social, and transpersonal planets. Displays the complete lists of planets in each element and mode.
		</P>
	</>
);

export const OrientationHelp: FC = () => (
	<>
		<P>
			This panel summarizes the chart’s orientation relative to the horizon and (local) meridian, listing the nodes contained in each quadrant.
		</P>
		<P>
			Note that these 4 quadrants need not appear square on the main chart, particularly at higher latitudes.
		</P>
	</>
);

export const RulershipGraphHelp: FC = () => (
	<>
		<P>
			This panel summarizes the chart’s dispositorship structure.
		</P>
		<P>
			<b>Final Dispositors.</b> Lists all terminal rulership structures in the chart. A final dispositor may be a single planet or a closed rulership loop.
		</P>
		<P>
			<b>Dispositorship Chains.</b> Shows one dispositorship chain for each leaf node (planet ruling no other planet), starting at that planet and ending at the first final dispositor encountered. Chains may share segments; shared segments are repeated.
		</P>
		<P>
			<b>Rulership Scheme.</b> Dispositorship structure depends on the selected dignity mode. Defaults to modern (post-19th-century Western rulerships), but classical (Ptolemaic, from the Tetrabiblos) is also available.
		</P>
	</>
);

export const NodeSelectorHelp: FC = () => (
	<>
		<P>
			This panel allows one to select which nodes are taken into account for analysis.
		</P>
		<P>
			<b>Effects.</b> The nodes selected here will be the nodes that appear on the main chart, the nodes for which aspects are calculated, and the nodes that can be selected in the planet info panel. The selection will not affect the nodes taken into consideration for element/mode analysis, orientation analysis, or rulership structure - these will always be the standard planets and luminaries.
		</P>
		<P>
			<b>Nodes.</b> The panel allows selection/unselection of:
		</P>
		<ul>
			<li>- All standard planets and luminaries.</li>
			<li>- All primary angles & other calculated points.</li>
			<li>- Arabic parts - currently only the Part of Fortune.</li>
			<li>- The North and South Lunar Nodes, as well as the Lilith and Selene (the lunar apogee and perigee). Note that these are the mean apogee/perigee by default - this can be changed in the settings.</li>
			<li>- Nearly every astrologically relevant TNO, separated into Major Asteroids & Dwarfs / Minor Bodies.</li>
			<li>- Hamburg School Objects, i.e. the trans-neptunian hypotheticals. The settings allow one to select between the Witte/Siegrrün and Neely (default) parameter sets, as well as whether these objects are considered physical (for aspect detection). </li>
		</ul>
	</>
);

export const GeneralSettingsHelp: FC = () => (
	<>
		<P>
			This is the settings panel, exposing options relating to which astrological conventions are followed, and for how the App is rendered visually.
		</P>
		<P>
			<b>Houses.</b> Allows for the selection of a specific house system. Also allows for toggling of the "house presweep" rule, where house cusps are understood to be 5 degrees into a house.
		</P>
		<P>
			<b>Labeling.</b> Allows for selection of whether each category of items with icons (nodes, zodiac symbols, etc) will prefer to be displayed as a label or as an icon. Note that this is not universal, e.g. the main chart will always use icons and nodes-within-text will always prefer rendering as text.
		</P>
		<P>
			<b>Visual Settings.</b> Other, generally self-descriptive choices about the visuals of the app.
		</P>
		<P>
			<b>Aspect Error Threshold.</b> Allows for the specification of a maximum error for each general kind of aspect (configuration, major binary, minor binary). Above these threshold potential aspects are discarded. Also allows for the selection of a definition re: how a configuration's error is defined. The standard, Pointwise-max, is equivalent to Pairwise-full-max, where a configuration's error is understood to be the maximum error of all the binary aspects within it.
		</P>
		<P>
			<b>Other Aspect Options.</b> Allows for the specification of how many physical nodes an aspect needs to be valid - the default value is "All but one", meaning at most one node can be non-physical in each aspect. Allows for the toggling of whether Hamburg School Objects should be treated as physical. Also allows for selection of aspect display mode - in the standard mode, "Maximal with submenus", each configuration will show beneath it its subaspects (e.g. a grand trine would be indicated to "contain" three trines). With "Only maximal", these subaspects are discarded (a trine does not appear by itself if it belongs to a grand trine. With "All", all aspects are shown with no hierarchy.
		</P>
		<P>
			<b>Lunar Nodes.</b> Allows for the selection of lunar node calculation mode. "True" uses astronomical calculation to figure out the true instantaneous position of all lunar nodes. "Mean" uses Meeus' polynomials to obtain the mean, non-osculating positions of the lunar nodes.
		</P>
		<P>
			<b>Astrology Mode.</b> Defaults to tropical astrology, but also allows the selection of sidereal astrology (with all major ayanamsa) and 13-sign constellation-based astrology. Note that "Constellations - IAU / Berg" is the standard system promoted by Walter Berg where the ecliptic is sliced up according to the IAU-defined constellation boundaries. "Constellations - Closest" is a mode specific to this app wherein the sign of each position along the ecliptic is decided by which constellation (as a graph on the stars, from Hipparchos' tables) is closest.
		</P>
		<P>
			<b>Dignities.</b> Allows for the selection of a standard set of dignities. "Modern" is the standard dignity definitions for post-19th-century Western astrology, all other tables of values are from the Tetrabiblos. Note that the selected dignity mode will decide the rulership tables, and thus affect the dispositorship graph.
		</P>
		<P>
			<b>Stationary nodes.</b> Allows for the setting of a percentual threshold - nodes moving below this percentage of their average speed will be considered stationary.
		</P>
		<P>
			<b>House angularity.</b> Decides how angularity is assigned to houses. "Traditional" sets Houses 1,4,7,10 to be angular, 2,5,8,11 succedent, etc. "Verified" does the same but only after checking that the main angles are in the angular houses, otherwise it does not assign any angularity. "Dynamic" defines any house containing a main angle to be angular, and any house prior/posterior to an angular house to be cadent/succedent.
		</P>
	</>
);

export const AspectMenuHelp: FC = () => (
	<>
		<P>
			This panel displays a list of all the aspects in the chart, or those incident on a selected node.
		</P>
		<P>
			<b>Node Selection.</b> Nodes may be selected by clicking on them in the main chart - this will cause this panel to show only aspects incident on the selected node. Nodes may be unselected by clicking anywhere on the main chart area, or on the "Show all aspects" button that will appear on top of this panel.
		</P>
		<P>
			<b>Aspect Data.</b> For each aspect, this panel shows the aspect kind, the nodes involved, and the orb.
		</P>
		<P>
			<b>Hierarchy.</b> By default, aspects that are "included" in another aspect (e.g. a trine in a grand trine) are shown indented below said aspect. This may be changed in the settings.
		</P>
		<P>
			<b>Interactability.</b> Hovering over any aspect will highlight this aspect in the main chart. In particular hovering over a parallel/contraparallel will also show the line connecting the two equinoxes, analogous to the celestial equator. Aspects may be discarded by clicking on the "X" button, though these may come back if the aspects need to be recomputed (e.g., node selection changes).
		</P>
	</>
);
