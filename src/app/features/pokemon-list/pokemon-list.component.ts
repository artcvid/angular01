/**
 * Pokemon List Component - Presentation Logic
 * Single Responsibility: Display Pokemon data and handle user interactions
 */

import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { PokemonDataService } from '../../data/services';
import { Pokemon } from '../../shared/models';
import {
  convertHeightToMeters,
  convertWeightToKilograms,
  generateRandomPokemonId,
  formatPokemonName
} from '../../shared/utils';
import { PokemonListState, INITIAL_POKEMON_LIST_STATE } from './pokemon-list.state';

@Component({
  selector: 'app-pokemon-list',
  host: {
    class: 'pokemon-container'
  },
  template: `
    <h1>:: Pokémon API Demo ::</h1>
    
    <div class="button-group">
      <button (click)="onLoadRandomPokemon()">Cargar Pokémones</button>
      <button (click)="onSearchPikachu()">Buscar Pikachu</button>
    </div>

    @if (state.pokemon) {
      <div class="pokemon-card">
        <h2>{{ formatName(state.pokemon.name) }}</h2>
        <img 
          [src]="state.pokemon.sprites.front_default" 
          [alt]="state.pokemon.name"
          width="200"
          height="200"
        />
        <p><strong>ID:</strong> {{ state.pokemon.id }}</p>
        <p><strong>Altura:</strong> {{ convertHeight(state.pokemon.height) }} m</p>
        <p><strong>Peso:</strong> {{ convertWeight(state.pokemon.weight) }} kg</p>
        <p><strong>Tipos:</strong>
          @for (type of state.pokemon.types; track type.type.name) {
            <span class="type-badge">{{ type.type.name }}</span>
          }
        </p>
      </div>
    }

    @if (state.loading) {
      <p class="loading">Cargando...</p>
    }

    @if (state.error) {
      <p class="error">{{ state.error }}</p>
    }
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f0f2f5;
      min-height: 100vh;
      padding-top: 20px;
      padding-bottom: 20px;
    }

    .pokemon-container {
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }

    h1 {
      text-align: center;
      color: #2c3e50;
      font-weight: 600;
    }

    .button-group {
      margin: 20px 0;
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    button {
      padding: 10px 20px;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    button:first-of-type {
      background-color: #ef5350;
    }

    button:first-of-type:hover {
      background-color: #e53935;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    button:last-of-type {
      background-color: #fdd835;
      color: #424242;
    }

    button:last-of-type:hover {
      background-color: #fbc02d;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    button:active {
      transform: translateY(0) scale(0.98);
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .pokemon-card {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      background-color: #ffffff;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .pokemon-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    .pokemon-card h2 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 24px;
    }

    .pokemon-card img {
      background-color: #f5f5f5;
      border-radius: 50%;
      margin: 10px auto 20px;
      border: 4px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .pokemon-card:hover img {
      transform: scale(1.05);
    }

    .pokemon-card p {
      margin: 10px 0;
      color: #555;
      font-size: 14px;
    }

    .type-badge {
      display: inline-block;
      background-color: #78c850;
      color: white;
      padding: 5px 12px;
      border-radius: 12px;
      margin: 5px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .loading {
      text-align: center;
      color: #666;
      font-style: italic;
      margin-top: 20px;
    }

    .error {
      color: #d32f2f;
      text-align: center;
      margin-top: 20px;
      padding: 10px;
      background-color: #ffebee;
      border-radius: 4px;
      font-weight: bold;
    }
  `],
  // CommonModule is not needed for the new @-syntax for control flow.
})


export class PokemonListComponent {
  private readonly pokemonDataService = inject(PokemonDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected state: PokemonListState = { ...INITIAL_POKEMON_LIST_STATE };

  onLoadRandomPokemon(): void {
    const randomId = generateRandomPokemonId();
    this.loadPokemon(() =>
      this.pokemonDataService.getPokemonById(randomId)
    );
  }

  onSearchPikachu(): void {
    this.loadPokemon(() =>
      this.pokemonDataService.getPokemonByName('pikachu')
    );
  }

  private loadPokemon(request: () => Observable<Pokemon>): void {
    this.setState({
      loading: true,
      error: null
    });

    request().subscribe({
      next: (pokemon: Pokemon) => {
        this.setState({
          pokemon,
          loading: false,
          error: null
        });
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const errorMessage = this.getErrorMessage(err);
        this.setState({
          loading: false,
          error: errorMessage
        });
        this.cdr.detectChanges();
      },
    });
  }

  private setState(partial: Partial<PokemonListState>): void {
    this.state = { ...this.state, ...partial };
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Pokémon no encontrado';
    }
    return 'Error al cargar el pokémon. Intenta de nuevo.';
  }

  // Template utility methods
  protected convertHeight(height: number): string {
    return convertHeightToMeters(height).toFixed(2);
  }

  protected convertWeight(weight: number): string {
    return convertWeightToKilograms(weight).toFixed(2);
  }

  protected formatName(name: string): string {
    return formatPokemonName(name);
  }
}
