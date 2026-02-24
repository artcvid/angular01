export function convertHeightToMeters(heightInDecimeters: number): number {
    return heightInDecimeters / 10;
}

export function convertWeightToKilograms(weightInHectograms: number): number {
    return weightInHectograms / 10;
}

export function formatPokemonName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function generateRandomPokemonId(max: number = 151): number {
    return Math.floor(Math.random() * max) + 1;
}