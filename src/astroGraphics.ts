import { Node, Zodiac, Element, Mode } from './astroDefs.ts'
import { AspectKind } from './aspectDefs.ts'

import ariesSymbol from "./assets/zodiac-symbols/Aries.png"
import taurusSymbol from "./assets/zodiac-symbols/Taurus.png"
import geminiSymbol from "./assets/zodiac-symbols/Gemini.png"
import cancerSymbol from "./assets/zodiac-symbols/Cancer.png"
import leoSymbol from "./assets/zodiac-symbols/Leo.png"
import virgoSymbol from "./assets/zodiac-symbols/Virgo.png"
import libraSymbol from "./assets/zodiac-symbols/Libra.png"
import scorpioSymbol from "./assets/zodiac-symbols/Scorpio.png"
import ophiuchusSymbol from "./assets/zodiac-symbols/Ophiuchus.png"
import sagittariusSymbol from "./assets/zodiac-symbols/Sagittarius.png"
import capricornSymbol from "./assets/zodiac-symbols/Capricorn.png"
import aquariusSymbol from "./assets/zodiac-symbols/Aquarius.png"
import piscesSymbol from "./assets/zodiac-symbols/Pisces.png"

import airSymbol from "./assets/element-symbols/Air.png"
import fireSymbol from "./assets/element-symbols/Fire.png"
import earthElementSymbol from "./assets/element-symbols/Earth.png"
import waterSymbol from "./assets/element-symbols/Water.png"

import cardinalSymbol from "./assets/mode-symbols/Cardinal.png"
import fixedSymbol from "./assets/mode-symbols/Fixed.png"
import mutableSymbol from "./assets/mode-symbols/Mutable.png"

import earthSymbol from "./assets/body-symbols/Earth.png"
import jupiterSymbol from "./assets/body-symbols/Jupiter.png"
import marsSymbol from "./assets/body-symbols/Mars.png"
import mercurySymbol from "./assets/body-symbols/Mercury.png"
import moonSymbol from "./assets/body-symbols/Moon.png"
import neptuneSymbol from "./assets/body-symbols/Neptune.png"
import plutoSymbol from "./assets/body-symbols/Pluto.png"
import saturnSymbol from "./assets/body-symbols/Saturn.png"
import sunSymbol from "./assets/body-symbols/Sun.png"
import uranusSymbol from "./assets/body-symbols/Uranus.png"
import venusSymbol from "./assets/body-symbols/Venus.png"
import ascendantSymbol from "./assets/body-symbols/Ascendant.png"
import descendantSymbol from "./assets/body-symbols/Descendant.png"
import midheavenSymbol from "./assets/body-symbols/Midheaven.png"
import imumCoeliSymbol from "./assets/body-symbols/Imum Coeli.png"
import vertexSymbol from "./assets/body-symbols/Vertex.png"
import antivertexSymbol from "./assets/body-symbols/Antivertex.png"
import vernalEquinoxSymbol from "./assets/body-symbols/Vernal Equinox.png"
import autumnalEquinoxSymbol from "./assets/body-symbols/Autumnal Equinox.png"
import lunarAscendingSymbol from "./assets/body-symbols/Lunar Ascending.png"
import lunarDescendingSymbol from "./assets/body-symbols/Lunar Descending.png"
import partOfFortuneSymbol from "./assets/body-symbols/Part of Fortune.png"
import lunarApogeeSymbol from "./assets/body-symbols/Lilith.png"
import lunarPerigeeSymbol from "./assets/body-symbols/Selene.png"
import ceresSymbol from "./assets/body-symbols/Ceres.png"
import chironSymbol from "./assets/body-symbols/Chiron.png"
import erisSymbol from "./assets/body-symbols/Eris.png"
import haumeaSymbol from "./assets/body-symbols/Haumea.png"
import junoSymbol from "./assets/body-symbols/Juno.png"
import makemakeSymbol from "./assets/body-symbols/Makemake.png"
import pallasSymbol from "./assets/body-symbols/Pallas.png"
import sednaSymbol from "./assets/body-symbols/Sedna.png"
import vestaSymbol from "./assets/body-symbols/Vesta.png"
import cupidoSymbol from "./assets/body-symbols/Cupido.png"
import hadesSymbol from "./assets/body-symbols/Hades.png"
import zeusSymbol from "./assets/body-symbols/Zeus.png"
import kronosSymbol from "./assets/body-symbols/Kronos.png"
import apollonSymbol from "./assets/body-symbols/Apollon.png"
import admetosSymbol from "./assets/body-symbols/Admetos.png"
import vulcanusSymbol from "./assets/body-symbols/Vulcanus.png"
import poseidonSymbol from "./assets/body-symbols/Poseidon.png"
import astraeaSymbol from "./assets/body-symbols/Astraea.png"
import hygieaSymbol from "./assets/body-symbols/Hygiea.png"
import pholusSymbol from "./assets/body-symbols/Pholus.png"
import nessusSymbol from "./assets/body-symbols/Nessus.png"
import charikloSymbol from "./assets/body-symbols/Chariklo.png"
import hylonomeSymbol from "./assets/body-symbols/Hylonome.png"
import cyllarusSymbol from "./assets/body-symbols/Cyllarus.png"
import gonggongSymbol from "./assets/body-symbols/Gonggong.png"
import quaoarSymbol from "./assets/body-symbols/Quaoar.png"
import orcusSymbol from "./assets/body-symbols/Orcus.png"
import salaciaSymbol from "./assets/body-symbols/Salacia.png"
import vardaSymbol from "./assets/body-symbols/Varda.png"
import ixionSymbol from "./assets/body-symbols/Ixion.png"
import varunaSymbol from "./assets/body-symbols/Varuna.png"
import typhonSymbol from "./assets/body-symbols/Typhon.png"
import chaosSymbol from "./assets/body-symbols/Chaos.png"
import radamanthusSymbol from "./assets/body-symbols/Radamanthus.png"
import gkunhomdimaSymbol from "./assets/body-symbols/Gkunhomdima.png"

import conjunctionSymbol from "./assets/aspect-symbols/Conjunction.png"
import oppositionSymbol from "./assets/aspect-symbols/Opposition.png"
import trineSymbol from "./assets/aspect-symbols/Trine.png"
import squareSymbol from "./assets/aspect-symbols/Square.png"
import sextileSymbol from "./assets/aspect-symbols/Sextile.png"
import parallelSymbol from "./assets/aspect-symbols/Parallel.png"
import contraparallelSymbol from "./assets/aspect-symbols/Contraparallel.png"

import binovileSymbol from "./assets/aspect-symbols/Binovile.png"
import biquintileSymbol from "./assets/aspect-symbols/Biquintile.png"
import biseptileSymbol from "./assets/aspect-symbols/Biseptile.png"
import decileSymbol from "./assets/aspect-symbols/Decile.png"
import novileSymbol from "./assets/aspect-symbols/Novile.png"
import quadranovileSymbol from "./assets/aspect-symbols/Quadranovile.png"
import quincunxSymbol from "./assets/aspect-symbols/Quincunx.png"
import quintileSymbol from "./assets/aspect-symbols/Quintile.png"
import semisextileSymbol from "./assets/aspect-symbols/Semisextile.png"
import semisquareSymbol from "./assets/aspect-symbols/Semisquare.png"
import septileSymbol from "./assets/aspect-symbols/Septile.png"
import sesquiquadrateSymbol from "./assets/aspect-symbols/Sesquiquadrate.png"
import tredecileSymbol from "./assets/aspect-symbols/Tredecile.png"
import triseptileSymbol from "./assets/aspect-symbols/Triseptile.png"
import undecileSymbol from "./assets/aspect-symbols/Undecile.png"
import vigintileSymbol from "./assets/aspect-symbols/Vigintile.png"

import grandTrineSymbol from "./assets/aspect-symbols/Grand Trine.png"
import grandSquareSymbol from "./assets/aspect-symbols/Grand Square.png"
import grandSextileSymbol from "./assets/aspect-symbols/Grand Sextile.png"
import fingerOfYodSymbol from "./assets/aspect-symbols/Finger of Yod.png"
import kiteSymbol from "./assets/aspect-symbols/Kite.png"
import mysticRectangleSymbol from "./assets/aspect-symbols/Mystic Rectangle.png"
import tSquareSymbol from "./assets/aspect-symbols/T-Square.png"

import dotSymbol from "./assets/general-symbols/Dot.png"

import earthImage from "./assets/planet-images/Earth.png" //unused
import jupiterImage from "./assets/planet-images/Jupiter.png"
import marsImage from "./assets/planet-images/Mars.png"
import mercuryImage from "./assets/planet-images/Mercury.png"
import moonImage from "./assets/planet-images/Moon.png"
import neptuneImage from "./assets/planet-images/Neptune.png"
import plutoImage from "./assets/planet-images/Pluto.png"
import saturnImage from "./assets/planet-images/Saturn.png"
import sunImage from "./assets/planet-images/Sun.png"
import uranusImage from "./assets/planet-images/Uranus.png"
import venusImage from "./assets/planet-images/Venus.png"

export { earthSymbol, dotSymbol };

export const nodeShortName: Partial<Record<Node, String>> = {
	[Node.LUNAR_ASCENDING] : "Lunar ▲",
	[Node.LUNAR_DESCENDING] : "Lunar ▼",
	[Node.LUNAR_APOGEE] : "Lilith",
	[Node.LUNAR_PERIGEE] : "Selene",
	[Node.PART_OF_FORTUNE] : "Fortuna",
	[Node.RADAMANTHUS] : "R-manthus",
	[Node.GKUNHOMDIMA] : "G-Hmdima",
	[Node.VERNAL_EQUINOX] : "Vernal Eq.",
	[Node.AUTUMNAL_EQUINOX] : "Autumnal Eq.",
}

export const nodePreferredName: Partial<Record<Node, String>> = {
	[Node.LUNAR_ASCENDING] : "Lunar North",
	[Node.LUNAR_DESCENDING] : "Lunar South",
	[Node.LUNAR_APOGEE] : "Lilith",
	[Node.LUNAR_PERIGEE] : "Selene",
}

export const aspectKindShortName: Partial<Record<AspectKind, String>> = {
}

export const nodesWithRedundantSymbols: Node[] = [
	Node.ASCENDANT,
	Node.DESCENDANT,
	Node.MIDHEAVEN,
	Node.IMUM_COELI,
	Node.VERTEX,
	Node.ANTIVERTEX,
	Node.VERNAL_EQUINOX,
	Node.AUTUMNAL_EQUINOX
];

// note the main angles will be specifically excluded from using article depending on config
export const nodesAdmittingArticle: Node[] = [
	Node.SUN,
	Node.MOON,
	Node.ASCENDANT,
	Node.IMUM_COELI,
	Node.DESCENDANT,
	Node.MIDHEAVEN,
	Node.VERTEX,
	Node.ANTIVERTEX,
	Node.VERNAL_EQUINOX,
	Node.AUTUMNAL_EQUINOX,
	Node.PART_OF_FORTUNE,
];
	
export const zodiacSymbols: Record<Zodiac, string> = {
	[Zodiac.ARIES] : ariesSymbol,
	[Zodiac.TAURUS] : taurusSymbol,
	[Zodiac.GEMINI] : geminiSymbol,
	[Zodiac.CANCER] : cancerSymbol,
	[Zodiac.LEO] : leoSymbol,
	[Zodiac.VIRGO] : virgoSymbol,
	[Zodiac.LIBRA] : libraSymbol,
	[Zodiac.SCORPIO] : scorpioSymbol,
	[Zodiac.OPHIUCHUS] : ophiuchusSymbol,
	[Zodiac.SAGITTARIUS] : sagittariusSymbol,
	[Zodiac.CAPRICORN] : capricornSymbol,
	[Zodiac.AQUARIUS] : aquariusSymbol,
	[Zodiac.PISCES] : piscesSymbol
}
	
export const elementSymbols: Record<Element, string> = {
	[Element.AIR] : airSymbol,
	[Element.FIRE] : fireSymbol,
	[Element.EARTH] : earthElementSymbol,
	[Element.WATER] : waterSymbol,
}
	
export const modeSymbols: Record<Mode, string> = {
	[Mode.CARDINAL] : cardinalSymbol,
	[Mode.FIXED] : fixedSymbol,
	[Mode.MUTABLE] : mutableSymbol,
}

export const nodeSymbols: Record<Node, string> = {
	[Node.SUN] : sunSymbol,
	[Node.MOON] : moonSymbol,
	[Node.MERCURY] : mercurySymbol,
	[Node.VENUS] : venusSymbol,
	[Node.MARS] : marsSymbol,
	[Node.JUPITER] : jupiterSymbol,
	[Node.SATURN] : saturnSymbol,
	[Node.URANUS] : uranusSymbol,
	[Node.NEPTUNE] : neptuneSymbol,
	[Node.PLUTO] : plutoSymbol,
	[Node.ASCENDANT] : ascendantSymbol,
	[Node.DESCENDANT] : descendantSymbol,
	[Node.MIDHEAVEN] : midheavenSymbol,
	[Node.IMUM_COELI] : imumCoeliSymbol,
	[Node.VERTEX] : vertexSymbol,
	[Node.ANTIVERTEX] : antivertexSymbol,
	[Node.VERNAL_EQUINOX] : vernalEquinoxSymbol,
	[Node.AUTUMNAL_EQUINOX] : autumnalEquinoxSymbol,
	[Node.LUNAR_ASCENDING] : lunarAscendingSymbol,
	[Node.LUNAR_DESCENDING] : lunarDescendingSymbol,
	[Node.LUNAR_APOGEE] : lunarApogeeSymbol,
	[Node.LUNAR_PERIGEE] : lunarPerigeeSymbol,
	[Node.PART_OF_FORTUNE] : partOfFortuneSymbol,
	[Node.CERES] : ceresSymbol,
	[Node.CHIRON] : chironSymbol,
	[Node.ERIS] : erisSymbol,
	[Node.HAUMEA] : haumeaSymbol,
	[Node.JUNO] : junoSymbol,
	[Node.MAKEMAKE] : makemakeSymbol,
	[Node.PALLAS] : pallasSymbol,
	[Node.SEDNA] : sednaSymbol,
	[Node.VESTA] : vestaSymbol,
	[Node.CUPIDO] : cupidoSymbol,
	[Node.HADES] : hadesSymbol,
	[Node.ZEUS] : zeusSymbol,
	[Node.KRONOS] : kronosSymbol,
	[Node.APOLLON] : apollonSymbol,
	[Node.ADMETOS] : admetosSymbol,
	[Node.VULCANUS] : vulcanusSymbol,
	[Node.POSEIDON] : poseidonSymbol,
	[Node.ASTRAEA] : astraeaSymbol,
	[Node.HYGIEA] : hygieaSymbol,
	[Node.PHOLUS] : pholusSymbol,
	[Node.NESSUS] : nessusSymbol,
	[Node.CHARIKLO] : charikloSymbol,
	[Node.HYLONOME] : hylonomeSymbol,
	[Node.CYLLARUS] : cyllarusSymbol,
	[Node.GONGGONG] : gonggongSymbol,
	[Node.QUAOAR] : quaoarSymbol,
	[Node.ORCUS] : orcusSymbol,
	[Node.SALACIA] : salaciaSymbol,
	[Node.VARDA] : vardaSymbol,
	[Node.IXION] : ixionSymbol,
	[Node.VARUNA] : varunaSymbol,
	[Node.TYPHON] : typhonSymbol,
	[Node.CHAOS] : chaosSymbol,
	[Node.RADAMANTHUS] : radamanthusSymbol,
	[Node.GKUNHOMDIMA] : gkunhomdimaSymbol,
}

export const nodeImages: Record<Node, string> = {
	[Node.SUN] : sunImage,
	[Node.MOON] : moonImage,
	[Node.MERCURY] : mercuryImage,
	[Node.VENUS] : venusImage,
	[Node.MARS] : marsImage,
	[Node.EARTH] : earthImage,
	[Node.JUPITER] : jupiterImage,
	[Node.SATURN] : saturnImage,
	[Node.URANUS] : uranusImage,
	[Node.NEPTUNE] : neptuneImage,
	[Node.PLUTO] : plutoImage,
}

export const aspectSymbols: Record<AspectKind, string> = {
	[AspectKind.CONJUNCTION] : conjunctionSymbol,
	[AspectKind.OPPOSITION] : oppositionSymbol,
	[AspectKind.TRINE] : trineSymbol,
	[AspectKind.SQUARE] : squareSymbol,
	[AspectKind.SEXTILE] : sextileSymbol,
	[AspectKind.PARALLEL] : parallelSymbol,
	[AspectKind.CONTRAPARALLEL] : contraparallelSymbol,	
	[AspectKind.BINOVILE] : binovileSymbol,
	[AspectKind.BIQUINTILE] : biquintileSymbol,
	[AspectKind.BISEPTILE] : biseptileSymbol,
	[AspectKind.DECILE] : decileSymbol,
	[AspectKind.NOVILE] : novileSymbol,
	[AspectKind.QUADRANOVILE] : quadranovileSymbol,
	[AspectKind.QUINCUNX] : quincunxSymbol,
	[AspectKind.QUINTILE] : quintileSymbol,
	[AspectKind.SEMISEXTILE] : semisextileSymbol,
	[AspectKind.SEMISQUARE] : semisquareSymbol,
	[AspectKind.SEPTILE] : septileSymbol,
	[AspectKind.SESQUIQUADRATE] : sesquiquadrateSymbol,
	[AspectKind.TREDECILE] : tredecileSymbol,
	[AspectKind.TRISEPTILE] : triseptileSymbol,
	[AspectKind.UNDECILE] : undecileSymbol,
	[AspectKind.VIGINTILE] : vigintileSymbol,
	[AspectKind.GRAND_TRINE] : grandTrineSymbol,
	[AspectKind.GRAND_SQUARE] : grandSquareSymbol,
	[AspectKind.GRAND_SEXTILE] : grandSextileSymbol,
	[AspectKind.FINGER_OF_YOD] : fingerOfYodSymbol,
	[AspectKind.KITE] : kiteSymbol,
	[AspectKind.MYSTIC_RECTANGLE] : mysticRectangleSymbol,
	[AspectKind.T_SQUARE] : tSquareSymbol,
}

export const aspectKindColors: Partial<Record<AspectKind, [number, number, number]>> = {
	//conjunction and contra/parallels don't require color
	[AspectKind.GRAND_TRINE] : [31, 0, 256],
	[AspectKind.GRAND_SQUARE] : [10, 256, 0],
	[AspectKind.GRAND_SEXTILE] : [5, 114, 256],
	[AspectKind.FINGER_OF_YOD] : [214, 99, 0],
	[AspectKind.KITE] : [198, 0, 256],
	[AspectKind.MYSTIC_RECTANGLE] : [256, 83, 188],
	[AspectKind.T_SQUARE] : [0, 235, 188],
	
	[AspectKind.OPPOSITION] : [256, 240, 15],
	[AspectKind.TRINE] : [73, 41, 245],
	[AspectKind.SQUARE] : [41, 120, 62],
	[AspectKind.SEXTILE] : [156, 156, 135],
	[AspectKind.PARALLEL] : [256, 99, 78],
	[AspectKind.CONTRAPARALLEL] : [36, 78, 130],
	
	[AspectKind.BINOVILE] : [120, 67, 88],
	[AspectKind.BIQUINTILE] : [0, 67, 67],
	[AspectKind.BISEPTILE] : [0, 151, 0],
	[AspectKind.DECILE] : [99, 182, 31],
	[AspectKind.NOVILE] : [208, 26, 125],
	[AspectKind.QUADRANOVILE] : [256, 47, 26],
	[AspectKind.QUINCUNX] : [0, 57, 188],
	[AspectKind.QUINTILE] : [114, 120, 256],
	[AspectKind.SEMISEXTILE] : [88, 78, 0],
	[AspectKind.SEMISQUARE] : [135, 256, 135],
	[AspectKind.SEPTILE] : [256, 156, 256],
	[AspectKind.SESQUIQUADRATE] : [161, 57, 245],
	[AspectKind.TREDECILE] : [0, 26, 256],
	[AspectKind.TRISEPTILE] : [256, 161, 41],
	[AspectKind.UNDECILE] : [104, 26, 120],
	[AspectKind.VIGINTILE] : [36, 156, 182],
}