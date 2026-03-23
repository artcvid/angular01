export interface PokemonType {
    name: string;
}

export interface PokemonTypeWrapper {
    type: PokemonType;
}

export interface PokemonSprites {
    front_default: string;
}

export interface PokemonAbility {
    name: string;
    url: string;
}

export interface PokemonAbilityWrapper {
    ability: PokemonAbility;
    is_hidden: boolean;
    slot: number;
}

export interface PokemonCries {
    latest: string;
    legacy: string;
}

export interface PokemonStat {
    name: string;
    url: string;
}

export interface PokemonStatWrapper {
    base_stat: number;
    effort: number;
    stat: PokemonStat;
}

export interface Pokemon {
    id: number;
    name: string;
    base_experience: number;
    sprites: PokemonSprites;
    types: PokemonTypeWrapper[];
    abilities: PokemonAbilityWrapper[];
    cries: PokemonCries;
    stats: PokemonStatWrapper[];
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