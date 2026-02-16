// ポケモンリボントラッカー 共通型定義

export interface RibbonStatus {
  id: string;
  name: string;
  obtained: boolean;
}

export interface Pokemon {
  id: string;
  number: string;
  name: string;
  imageUrl?: string;
  types: string[];
  ribbons?: RibbonStatus[];
}

export interface PokemonDetail {
  id: string;
  dexNumber: number;
  name: string;
  types: string[];
  generation: number;
  image: string;
  category: string;
  height: number;
  weight: number;
  abilities: string[];
}

export interface Ribbon {
  id: string;
  name: string;
  description: string;
  generation: number;
  games: string[];
  category: string;
  requirements?: string;
  image_url?: string;
}

export interface Game {
  id: string;
  name: string;
  shortName: string;
  generation: number;
  releaseDate: string;
  platform: string;
}

export interface FilterState {
  generation: number | null;
  type: string | null;
  status: 'obtained' | 'not-obtained' | null;
  search: string;
}
