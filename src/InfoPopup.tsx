import { useState, type FC, type ReactNode } from 'react';

type InfoPopupProps = {
	children: ReactNode;
};

const InfoPopup: FC<InfoPopupProps> = ({ children }) => {
	const [dismissed, setDismissed] = useState(false);

	if (dismissed) return null;

	return (
		<div
			className="bg-theme-bg text-theme-text px-4 py-3 font-mono text-sm border border-theme-border max-w-[400px] leading-relaxed relative"
			onClick={(e) => e.stopPropagation()}
		>
			<button
				className="absolute top-1.5 right-2 bg-transparent border-none text-theme-text cursor-pointer p-0 m-0 text-sm hover:opacity-70"
				onClick={() => setDismissed(true)}
			>
				✕
			</button>
			{children}
		</div>
	);
};

export default InfoPopup;
