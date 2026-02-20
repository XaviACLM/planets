import { useState, useEffect, useRef } from "react";
import { type CityData, CitySearchEngine } from "./CitySearchEngine.ts"

interface CitySelectorProps {
	selectedCity: CityData | null;
	defaultString: string;
	onSelect: (city: CityData | null) => void;
}

export function CitySelector({ selectedCity, defaultString, onSelect }: CitySelectorProps) {
	const [ query, setQuery ] = useState<string>("");
	const [ results, setResults ] = useState<CityData[]>([]);
	//const [ isLoading, setIsLoading ] = useState<boolean>(false);
	const [ localSelected, setLocalSelected ] = useState<CityData | null>(null);
	const cseRef = useRef<CitySearchEngine|null>(null);

	const cityToString = (city: CityData) =>
		[city.cityName, city.stateName, city.countryName].filter(Boolean).join(", ");

	useEffect(() => {
		cseRef.current = new CitySearchEngine();
	}, []);

	// Sync query text when selectedCity changes externally (e.g. from a different CitySelector instance)
	// but not when we were the ones who set it (localSelected would match)
	useEffect(() => {
		if (selectedCity != null && selectedCity !== localSelected) {
			setQuery(cityToString(selectedCity));
			setLocalSelected(selectedCity);
		} else if (selectedCity == null && localSelected != null) {
			setQuery("");
			setLocalSelected(null);
		}
	}, [selectedCity]);

	const runSearch = (text: string) => {
		if (!cseRef.current || text.length < 2) {
			setResults([]);
			return;
		}
		const indexOfComma = text.indexOf(",");
		const searchTerm = indexOfComma === -1 ? text : text.slice(0, indexOfComma);
		const regex = new RegExp(searchTerm + ".*", "i");
		setResults(cseRef.current.searchCities(regex, 5));
	};

	useEffect(() => {
		if (localSelected != null) return;
		if (!cseRef.current || query.length < 2) {
			setResults([]);
			return;
		}

		const timeout = setTimeout(() => runSearch(query), 250);
		return () => clearTimeout(timeout);
	}, [query, localSelected]);

	const handleSelect = (cityData: CityData) => {
		setLocalSelected(cityData);
		setQuery(cityToString(cityData));
		setResults([]);
		onSelect(cityData);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		if (query.trim() === '') {
			setQuery('');
			setLocalSelected(null);
			onSelect(null);
		} else if (results.length > 0) {
			handleSelect(results[0]);
		} else {
			setQuery('');
			setLocalSelected(null);
			onSelect(null);
		}
	};

	const handleFocus = () => {
		if (query.length >= 2) {
			runSearch(query);
		}
	};

	return (
		<div className="relative w-full">
			<input
				className="w-full bg-transparent border-b border-theme-text/50 py-1 outline-none text-theme-text text-sm"
				type="text"
				placeholder={defaultString}
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setLocalSelected(null);
				}}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
			/>

			{/*
			{isLoading && <div className="absolute top-full left-0 text-gray-500 text-sm pt-1">Loading...</div>}
			*/}

			{results.length>0 && (
				<ul className="absolute top-full left-0 right-0 bg-theme-bg z-10 list-none m-0 p-0">
					{results.map((r,i) => {
						return (
							<li
								className="px-1 border-b border-theme-text/50 cursor-pointer text-theme-text text-sm hover:bg-gray-500/20"
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
