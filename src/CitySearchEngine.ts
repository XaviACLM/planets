interface City {
  id: string;
  name: string;
  country: string;
  admin1: string | null;
  lat: string;
  lon: string;
  pop: string;
  timezone: string;
}

export interface CityData {
  countryName: string;
  stateName: string | null;
  cityName: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
}

import citiesData from './assets/city-data/cities_enriched.json';

export const barcelonaCityData: CityData = {
	countryName: "Spain",
	stateName: "Catalunya",
	cityName: "Barcelona",
	latitude: 41.38879,
	longitude: 2.15899,
	population: 1621537,
	timezone: "Europe/Paris",
};

export class CitySearchEngine {
  private countryCodeMap: Map<string, string>;
  private sortedCities: City[];

  constructor() {
	this.sortedCities = citiesData.sort((a, b) => 
      parseInt(b.pop) - parseInt(a.pop)
    );
    
	this.countryCodeMap = new Map([
      ['ES', 'Spain'],
      ['FR', 'France'],
      ['US', 'United States'],
      ['BR', 'Brazil'],
      ['PH', 'Philippines'],
      ['AD', 'Andorra'],
      ['AE', 'United Arab Emirates'],
      // TODO add the rest
    ]);
  }

  searchCities(
    cityPattern: RegExp, 
    maxMatches: number = 10
  ): CityData[] {
    const matches: CityData[] = [];

    for (const city of this.sortedCities) {
      if (cityPattern.test(city.name)) {
        matches.push({
          countryName: this.countryCodeMap.get(city.country) || city.country,
          stateName: city.admin1,
          cityName: city.name,
          latitude: parseFloat(city.lat),
          longitude: parseFloat(city.lon),
          population: parseInt(city.pop),
		  timezone: city.timezone,
        });
		if (matches.length >= maxMatches) break;
      }
    }
	
	return matches;
  }

  searchCity(cityPattern: RegExp): CityData | null {
    const results = this.searchCities(cityPattern, 1);
    return results.length > 0 ? results[0] : null;
  }
}