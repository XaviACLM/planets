import { useState, useCallback, type ReactNode } from 'react';

interface WelcomeModalProps {
	hasLocation: boolean;
	onProceed: () => void;
	children: ReactNode;
}

export default function WelcomeModal({
	hasLocation,
	onProceed,
	children,
}: WelcomeModalProps) {
	const [flash, setFlash] = useState(false);

	const handleBackdropClick = useCallback(() => {
		setFlash(true);
		setTimeout(() => setFlash(false), 500);
	}, []);

	return (
		<div
			className="fixed inset-0 z-[1000] flex items-center justify-center"
			onClick={handleBackdropClick}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/5 backdrop-blur-sm" />

			{/* Modal */}
			<div
				className="relative bg-theme-bg border border-theme-border p-6 w-full max-w-sm"
				style={{ borderRadius: 'var(--border-radius)' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex flex-col gap-4">
					{children}

					{/* Proceed button — aligned right */}
					<div className="flex justify-end mt-2">
						<button
							className={`border border-theme-border px-4 py-1.5 text-sm bg-transparent text-theme-text cursor-pointer hover:bg-theme-text/10 transition-colors duration-200 ${flash ? 'animate-flash' : ''}`}
							onClick={onProceed}
						>
							{hasLocation ? 'Proceed' : 'Proceed without location'}
						</button>
					</div>

					{/* Help text — bottom left */}
					<div className="text-theme-text text-xs opacity-50" style={{ fontStyle: 'italic' }}>
						Date/time and location can be modified later.
					</div>
				</div>
			</div>
		</div>
	);
}
