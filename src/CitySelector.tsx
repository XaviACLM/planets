import { useState, useEffect, useRef, FC } from "react";
import { type SearchResult, CitySearchEngine } from "./CitySearchEngine.ts"

import "./CitySelector.css";

interface CitySelectorProps {
	onSelect: (city: SearchResult) => void;
}

export function CitySelector({onSelect}: CitySelectorProps) {
	const [ query, setQuery ] = useState<string>("");
	const [ results, setResults ] = useState<SearchResult[]>([]);
	const [ isLoading, setIsLoading ] = useState<boolean>(false);
	const [ selected, setSelected ] = useState<SearchResult | null>(null);
	const cseRef = useRef<CitySearchEngine|null>(null);
	
	useEffect(() => {
		cseRef.current = new CitySearchEngine();
	}, []);
	
	useEffect(() => {
		if (!cseRef.current || query.length < 2) {
			setResults([]);
			return;
		}
		
		const timeout = setTimeout(async () => {
			setIsLoading(true);
			const regex = new RegExp(query + ".*", "i");
			const res = cseRef.current.searchCities(regex, 5);
			setResults(res);
			setIsLoading(false);
		}, 250);
		
		return () => clearTimeout(timeout);
	}, [query]);
	
	const handleSelect = (searchResult: SearchResult) => {
		setSelected(searchResult);
		setQuery(searchResult.cityName+", "+searchResult.stateName+", "+searchResult.countryName); // todo fix
		setResults([]);
		onSelect(searchResult);
	};
	
	return (
		<div className="city-selector">
			<input className="city-input"
				type="text"
				placeholder="Type a city..."
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setSelected(null);
				}}
			/>
			
			{isLoading && <div className="dropdown-loading">Loading...</div>}
			
			{!isLoading && results.length>0 && (
				<ul className="dropdown">
					{results.map((r,i) => {
						return ( <li className="dropdown-item"
							key={i}
							onClick={() => handleSelect(r)}
						>
							{r.cityName}, {r.stateName}, {r.countryName}
						</li> );
					})}
				</ul>
			)}
		</div>
	)
}