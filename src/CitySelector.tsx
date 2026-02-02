import { useState, useEffect, useRef } from "react";
import { type CityData, CitySearchEngine } from "./CitySearchEngine.ts"

interface CitySelectorProps {
  startingQueryText: CityData | null;
  onSelect: (city: CityData) => void;
}

export function CitySelector({ startingQueryText, onSelect }: CitySelectorProps) {
	const [ query, setQuery ] = useState<string>("");
	const [ results, setResults ] = useState<CityData[]>([]);
	const [ isLoading, setIsLoading ] = useState<boolean>(false);
	const [ _selected, setSelected ] = useState<CityData | null>(null);
	const cseRef = useRef<CitySearchEngine|null>(null);

	useEffect(() => {
		cseRef.current = new CitySearchEngine();
	}, []);

	//
	useEffect(() => {
		if (startingQueryText != null) {
			setQuery([startingQueryText.cityName, startingQueryText.stateName, startingQueryText.countryName]
			.filter(Boolean)
			.join(", "));
		}
	}, []);

	useEffect(() => {
		if (!cseRef.current || query.length < 2) {
			setResults([]);
			return;
		}

		const timeout = setTimeout(async () => {
			if (!cseRef.current) return;
			setIsLoading(true);
			const regex = new RegExp(query + ".*", "i");
			const res = cseRef.current.searchCities(regex, 5);
			setResults(res);
			setIsLoading(false);
		}, 250);

		return () => clearTimeout(timeout);
	}, [query]);

	const handleSelect = (cityData: CityData) => {
		setSelected(cityData);
		setQuery([cityData.cityName, cityData.stateName, cityData.countryName]
		.filter(Boolean)
		.join(", "));
		setResults([]);
		onSelect(cityData);
	};

	return (
		<div className="relative w-full text-black font-sans">
			<input
				className="w-full bg-transparent border-b border-theme-text py-1 outline-none text-theme-text text-xs font-bold small-caps"
				type="text"
				placeholder="Type a city..."
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setSelected(null);
				}}
			/>

			{isLoading && <div className="absolute top-full left-0 text-gray-500 text-sm pt-1">Loading...</div>}

			{!isLoading && results.length>0 && (
				<ul className="absolute top-full left-0 right-0 bg-theme-bg border-t border-gray-800 z-10 list-none m-0 p-0">
					{results.map((r,i) => {
						return (
							<li
								className="px-1 border-b border-zinc-900 cursor-pointer text-theme-text text-xs font-bold small-caps hover:bg-zinc-900"
								key={i}
								onClick={() => handleSelect(r)}
							>
								{r.cityName}, {r.stateName}, {r.countryName}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	)
}
