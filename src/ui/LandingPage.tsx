import { Link } from 'react-router-dom';

export default function LandingPage() {
	return (
		<div className="h-screen w-screen flex items-center justify-center bg-theme-bg text-theme-text">
			<div className="flex flex-col gap-4 items-center">
				<h1 className="text-2xl small-caps tracking-wide mb-4">Planets</h1>
				<Link
					to="/event"
					className="border border-theme-border px-6 py-2 text-sm bg-transparent text-theme-text no-underline hover:bg-theme-text/10 transition-colors duration-200"
				>
					Event Chart
				</Link>
				<Link
					to="/natal"
					className="border border-theme-border px-6 py-2 text-sm bg-transparent text-theme-text no-underline hover:bg-theme-text/10 transition-colors duration-200"
				>
					Natal Chart
				</Link>
				<span
					className="border border-theme-border px-6 py-2 text-sm bg-transparent text-theme-text/40 cursor-not-allowed"
				>
					Return Chart (coming soon)
				</span>
			</div>
		</div>
	);
}
