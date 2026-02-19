import { Routes, Route } from 'react-router-dom'
import SingleChartPage from './ui/SingleChartPage'
import LandingPage from './ui/LandingPage'
import { useEventChartInputs } from './hooks/useEventChartInputs'
import { useNatalChartInputs } from './hooks/useNatalChartInputs'

// To auto-redirect to natal chart while landing page is under construction,
// uncomment the following and replace the "/" route below:
// import { Navigate } from 'react-router-dom'
// <Route path="/" element={<Navigate to="/natal" replace />} />

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/event" element={<SingleChartPage useChartInputs={useEventChartInputs} />} />
			<Route path="/natal" element={<SingleChartPage useChartInputs={useNatalChartInputs} />} />
		</Routes>
	);
}
