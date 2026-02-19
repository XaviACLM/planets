import { type ReactNode } from 'react';
import { useSettingsStore } from './settingsStore.ts';
import { Theme } from './settingsDefs.ts'

const SIDEBAR_DEFAULT_WIDTH = 360;

interface SidebarProps {
	side: 'left' | 'right';
	children: ReactNode;
	animationKey?: string;
	zoom?: number;
}

export function Sidebar({ side, children, animationKey, zoom = 1 }: SidebarProps) {
	const animation = side === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right';

	const theme = useSettingsStore(s => s.theme);
	const isDarkTheme = theme === Theme.DARK;

	return (
		<aside
			className="shrink-0 flex flex-col gap-2 p-2 bg-theme-bg overflow-y-auto overflow-x-hidden scrollbar-none relative"
			style={{ width: SIDEBAR_DEFAULT_WIDTH, zoom }}
		>
			{/* Dot lattice background */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
				<defs>
					<pattern
						id={`dot-pattern-${side}`}
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
						patternTransform="rotate(45)"
					>
						<rect
							width="1.5"
							height="1.5"
							fill="var(--color-text)"
						/>
					</pattern>
				</defs>
				<rect
					x="5%"
					width="90%"
					height="100%"
					opacity={isDarkTheme ? "30%" : "75%"}
					fill={`url(#dot-pattern-${side})`}
				/>
			</svg>

			{/* Content */}
			<div
				className={`flex flex-col gap-2 relative z-10 ${animation}`}
				key={animationKey}
			>
				{children}
			</div>
		</aside>
	);
}
