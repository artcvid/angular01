import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'pokemonTypeColor',
  standalone: true
})
export class PokemonTypeColorPipe implements PipeTransform {
  private colorMap: { [key: string]: string } = {
    fire: '#FF6B57',
    water: '#64B4F6',
    grass: '#51C84F',
    electric: '#FFD93D',
    psychic: '#F85888',
    ice: '#7FD8F6',
    dragon: '#7366BD',
    dark: '#705746',
    fairy: '#F6A5C7',
    steel: '#B7B9D0',
    flying: '#A890F0',
    poison: '#A552CC',
    ground: '#D2B48C',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    normal: '#A8A878',
    fighting: '#C03028'
  };
  transform(type: string): string {
    return this.colorMap[type.toLowerCase()] || '#999999';
  }
}