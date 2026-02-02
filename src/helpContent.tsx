import { type FC } from 'react';

// Shared styling for help content
const H2: FC<{ children: React.ReactNode }> = ({ children }) => (
	<h2 className="text-base font-bold small-caps tracking-wide mb-2 mt-4 first:mt-0">{children}</h2>
);

const P: FC<{ children: React.ReactNode }> = ({ children }) => (
	<p className="mb-2">{children}</p>
);

// ============================================================================
// Module Help Content
// ============================================================================

export const PlanetInfoHelp: FC = () => (
	<>
		<H2>Planet Information</H2>
		<P>
			TODO: Explain the planet panel - dignities, speeds, aspects, etc.
		</P>
	</>
);

export const DominanceChartHelp: FC = () => (
	<>
		<H2>Element and Mode Balance</H2>
		<P>
			TODO: Explain element/mode dominance analysis.
		</P>
	</>
);

export const OrientationHelp: FC = () => (
	<>
		<H2>Hemisphere Orientation</H2>
		<P>
			TODO: Explain hemisphere balance and chart orientation.
		</P>
	</>
);

export const RulershipGraphHelp: FC = () => (
	<>
		<H2>Rulership Graph</H2>
		<P>
			TODO: Explain planetary rulerships, dispositor chains, mutual receptions.
		</P>
	</>
);

export const NodeSelectorHelp: FC = () => (
	<>
		<H2>Node Selector</H2>
		<P>
			TODO: Explain the different celestial bodies and points available.
		</P>
	</>
);

export const AspectSelectorHelp: FC = () => (
	<>
		<H2>Aspect Selector</H2>
		<P>
			TODO: Explain aspect types - major, minor, configurations.
		</P>
	</>
);

export const GeneralSettingsHelp: FC = () => (
	<>
		<H2>General Settings</H2>
		<P>
			TODO: Explain the various settings and their effects.
		</P>
	</>
);

export const AspectMenuHelp: FC = () => (
	<>
		<H2>Aspect menu</H2>
		<P>
			TODO: Explain this and that.
		</P>
	</>
);
