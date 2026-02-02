import { ReactNode } from 'react';
import { useSettingsStore } from './settingsStore.ts';
import { Theme } from './settingsDefs.ts'

interface SidebarProps {
	side: 'left' | 'right';
	children: ReactNode;
	animationKey?: string;
}

export function Sidebar({ side, children, animationKey }: SidebarProps) {
	const animation = side === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right';
	
	const theme = useSettingsStore(s => s.theme);
	const isDarkTheme = theme === Theme.DARK;

	return (
		<aside className="w-[360px] shrink-0 flex flex-col gap-2 p-2 bg-theme-bg overflow-y-auto overflow-x-hidden scrollbar-none relative">
			{/* Dot lattice background */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
				<defs>
					<pattern
						id={`dot-pattern-${side}`}
						width="15"
						height="15"
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
					opacity={isDarkTheme ? "50%" : "100%"}
					fill={`url(#dot-pattern-${side})`}
				/>
			</svg>

			{/* Content */}
			<div className={`flex flex-col gap-2 relative z-10 ${animation}`} key={animationKey}>
				{children}
			</div>
		</aside>
	);
}
