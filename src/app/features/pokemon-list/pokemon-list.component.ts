/**
 * Pokemon List Component - Presentation Logic
 * Single Responsibility: Display Pokemon data and handle user interactions
 */

import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PokemonDataService } from '../../data/services';
import { Pokemon } from '../../shared/models';
import {
  convertHeightToMeters,
  convertWeightToKilograms,
  generateRandomPokemonId,
  formatPokemonName,
} from '../../shared/utils';
import { PokemonListState, INITIAL_POKEMON_LIST_STATE } from './pokemon-list.state';
import { NavButton } from '../nav-button/nav-button';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [NavButton],
  template: `
    <div class="container py-5" style="max-width: 550px;">
      <h1 class="text-center mb-5 display-4 fw-black pokemon-title">
        Poké-Explorer
      </h1>

      <div class="d-flex justify-content-center gap-3 mb-5">
        <button class="btn btn-danger btn-lg fw-bold rounded-pill px-4 border border-3 border-dark shadow d-flex align-items-center gap-2" style="background-color: #ff3334;" (click)="onLoadRandomPokemon()">
          Random
        </button>
        <button class="btn btn-warning text-dark btn-lg fw-bold rounded-pill px-4 border border-3 border-dark shadow d-flex align-items-center gap-2" style="background-color: #ffcb05;" (click)="onSearchPikachu()">
          Pikachu
        </button>
      </div>

      <!-- @let pokemon = (pokemon$ | async); -->
      @if (state.pokemon) {
        <div class="card pokemon-card border-4 border-dark rounded-5 overflow-hidden shadow-lg mx-auto" style="max-width: 420px; background-color: #f8f9fa;">
          
          <!-- Image Section  -->
          <div class="position-relative text-center pt-5 pb-4 img-backdrop" [style.backgroundColor]="getTypeColor(state.pokemon.types[0].type.name)">
            <span class="position-absolute top-0 start-0 m-3 badge bg-white text-dark border border-2 border-dark fs-5 rounded-pill shadow-sm">
              #{{ state.pokemon.id.toString().padStart(3, '0') }}
            </span>
            <div class="sprite-container mx-auto">
              <img
                [src]="state.pokemon.sprites.front_default"
                [alt]="state.pokemon.name"
                class="pokemon-img"
              />
            </div>
          </div>

          <!-- Detail Section -->
          <div class="card-body p-4 bg-white text-center position-relative card-overlap border-top border-4 border-dark">
            <h2 class="card-title text-capitalize fw-black mb-3 display-6">{{ formatName(state.pokemon.name) }}</h2>
            
            <div class="d-flex justify-content-center gap-2 mb-4">
              @for (type of state.pokemon.types; track type.type.name) {
                <span class="badge rounded-pill border border-2 border-dark text-capitalize px-3 py-2 fs-6 shadow-sm" [style.backgroundColor]="getTypeColor(type.type.name)">
                  {{ type.type.name }}
                </span>
              }
            </div>
            
            <div class="row g-2 mb-4 px-3">
              <div class="col-6">
                <div class="bg-light border border-2 border-secondary rounded-4 p-2 shadow-sm stat-box">
                  <div class="text-muted small fw-bold text-uppercase">Altura</div>
                  <div class="fw-bold fs-5">{{ convertHeight(state.pokemon.height) }} <span class="fs-6 text-muted">m</span></div>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-light border border-2 border-secondary rounded-4 p-2 shadow-sm stat-box">
                  <div class="text-muted small fw-bold text-uppercase">Peso</div>
                  <div class="fw-bold fs-5">{{ convertWeight(state.pokemon.weight) }} <span class="fs-6 text-muted">kg</span></div>
                </div>
              </div>
            </div>
            
            <app-nav-button [pokemonId]="state.pokemon.id" text="View Details" url="/pokemon-list"></app-nav-button>
          </div>
        </div>
        
        <div class="d-flex justify-content-center align-items-center gap-3 mt-5">
          <button class="btn btn-dark fw-bold rounded-circle border border-3 border-secondary shadow nav-ctrl d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background-color: #4a4a4a;" (click)="goFirst()"><<</button>
          <button class="btn border border-3 border-dark shadow nav-ctrl d-flex align-items-center justify-content-center fs-4" style="width: 65px; height: 50px; background-color: #e74c3c; color: white; border-radius: 15px;" (click)="goBack(state.pokemon.id)"><</button>
          <button class="btn border border-3 border-dark shadow nav-ctrl d-flex align-items-center justify-content-center fs-4" style="width: 65px; height: 50px; background-color: #2ecc71; color: white; border-radius: 15px;" (click)="goForward(state.pokemon.id)">></button>
          <button class="btn btn-dark fw-bold rounded-circle border border-3 border-secondary shadow nav-ctrl d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background-color: #4a4a4a;" (click)="goLast()">>></button>
        </div>
      }

      @if (state.loading) {
        <div class="text-center mt-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-muted fst-italic mt-2">Cargando...</p>
        </div>
      }

      @if (state.error) {
        <div class="alert alert-danger text-center mt-4 fw-bold shadow-sm" role="alert">
          {{ state.error }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background-color: #f4f7f6;
        background-image: radial-gradient(#d1d5db 2px, transparent 2px);
        background-size: 30px 30px;
        min-height: 100vh;
      }

      .fw-black {
        font-weight: 900;
      }

      .pokemon-title {
        color: #ffcb05;
        -webkit-text-stroke: 2px #3b4cca;
        text-shadow: 3px 3px 0 #3b4cca, 6px 6px 0 #000;
        letter-spacing: 2px;
        transform: rotate(-2deg);
      }

      .pokemon-card {
        transition:
          transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
          box-shadow 0.3s ease;
      }

      .pokemon-card:hover {
        transform: translateY(-8px) rotate(-1deg);
        box-shadow: 0 1rem 3rem rgba(0,0,0,.25) !important;
      }

      .img-backdrop {
        box-shadow: inset 0 -15px 20px rgba(0,0,0,0.1);
        transition: background-color 0.4s ease;
      }

      .sprite-container {
        width: 180px;
        height: 180px;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-overlap {
        margin-top: -20px;
        border-top-left-radius: 24px;
        border-top-right-radius: 24px;
      }

      .pokemon-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.6));
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .pokemon-card:hover .pokemon-img {
        transform: scale(1.2) rotate(4deg);
      }

      .nav-ctrl {
        transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s ease;
      }

      .nav-ctrl:active {
        transform: translateY(4px);
        box-shadow: none !important;
      }

      .stat-box {
        transition: transform 0.2s ease;
      }
      
      .stat-box:hover {
        transform: translateY(-3px);
      }
    `,
  ],
})
export class PokemonListComponent implements OnInit {
  private readonly pokemonDataService = inject(PokemonDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected state: PokemonListState = { ...INITIAL_POKEMON_LIST_STATE };

  ngOnInit(): void {
    // this.route.params.pipe(
    //   switchMap((params) => this.pokemonDataService.getPokemonById(params['id'])),
    // );
    this.route.queryParams.subscribe(params => {
      const pokemonId = params['id'];
      if (pokemonId) {
        this.loadPokemon(() => this.pokemonDataService.getPokemonById(pokemonId));
      }
    });
  }

  pokemon$ = this.route.params.pipe(
    switchMap((params) => this.pokemonDataService.getPokemonById(params['id'])),
  );

  goBack(pokemonId: string | number): void {
    const id = <number>pokemonId - 1
    this.router.navigate([], { queryParams: { id } });
  }

  goForward(pokemonId: string | number): void {
    const id = <number>pokemonId + 1
    this.router.navigate([], { queryParams: { id } });
  }

  goFirst(): void {
    this.router.navigate([], { queryParams: { id: 1 } });
  }

  goLast(): void {
    this.router.navigate([], { queryParams: { id: 1025 } })
  }

  onLoadRandomPokemon(id: number = generateRandomPokemonId()): void {
    this.router.navigate([], { queryParams: { id } });
  }

  onSearchPikachu(): void {
    this.router.navigate([], { queryParams: { id: 'pikachu' } });
  }

  private loadPokemon(request: () => Observable<Pokemon>): void {
    this.setState({
      loading: true,
      error: null,
    });

    request().subscribe({
      next: (pokemon: Pokemon) => {
        this.setState({
          pokemon,
          loading: false,
          error: null,
        });
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const errorMessage = this.getErrorMessage(err);
        this.setState({
          loading: false,
          error: errorMessage,
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

  protected getTypeColor(type: string): string {
    const typeColors: { [key: string]: string } = {
      normal: '#A8A77A',
      fire: '#EE8130',
      water: '#6390F0',
      electric: '#F7D02C',
      grass: '#7AC74C',
      ice: '#96D9D6',
      fighting: '#C22E28',
      poison: '#A33EA1',
      ground: '#E2BF65',
      flying: '#A98FF3',
      psychic: '#F95587',
      bug: '#A6B91A',
      rock: '#B6A136',
      ghost: '#735797',
      dragon: '#6F35FC',
      dark: '#705746',
      steel: '#B7B7CE',
      fairy: '#D685AD',
    };
    return typeColors[type.toLowerCase()] || '#777777'; // Fallback color
  }
}
