export interface PokemonType {
    name: string;
}

export interface PokemonTypeWrapper {
    type: PokemonType;
}

export interface PokemonSprites {
    front_default: string;
}

export interface Pokemon {
    id: number;
    name: string;
    sprites: PokemonSprites;
    types: PokemonTypeWrapper[];
    height: number;
    weight: number;
}

export interface PokemonListItem {
    name: string;
    url: string;
}

export interface PokemonList {
    count: number;
    next: string | null;
    previous: string | null;
    results: PokemonListItem[];
}