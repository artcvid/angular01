import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonDataService } from '../../data/services';
import { Pokemon } from '../../shared/models';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';
import { input } from '@angular/core';
import { convertHeightToMeters, convertWeightToKilograms } from '../../shared/utils';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule],
  template: `

    @let pokemon = (pokemon$ | async);
    @if (pokemon) {
      <div class="detail-container">
        <header class="header">
          <button class="app-nav-button" (click)="goBack(pokemon.id)">← Atrás</button>
          <h2>{{ pokemon.name | uppercase }} (#{{ pokemon.id }})</h2>
        </header>

        <div class="content-grid">
          <!-- Left Column: Image and Audio -->
          <div class="image-section">
            <img [src]="pokemon.sprites.front_default" [alt]="pokemon.name" class="main-image"/>
          </div>

          <!-- Right Column: Details, Abilities, and Stats -->
          <div class="info-section">
            <div class="badges">
              @for (type of pokemon.types; track type.type.name) {
                <span class="type-badge" [style.backgroundColor]="getTypeColor(type.type.name)">{{ type.type.name }}</span>
              }
            </div>

            <div class="basic-info">
              <p><strong>Base Experience:</strong> {{ pokemon.base_experience }}</p>
              <p><strong>Altura:</strong> {{ convertHeight(pokemon.height) }} m</p>
              <p><strong>Peso:</strong> {{ convertWeight(pokemon.weight) }} kg</p>
            </div>

            <div class="abilities-section">
              <h3>Abilities</h3>
              <ul>
                @for (ability of pokemon.abilities; track ability.ability.name) {
                  <li>
                    {{ ability.ability.name }} 
                    @if (ability.is_hidden) { <span class="hidden-badge">(Hidden)</span> }
                  </li>
                }
              </ul>
            </div>

            <div class="stats-section">
              <h3>Base Stats</h3>
              <div class="stats-grid">
                @for (stat of pokemon.stats; track stat.stat.name) {
                  <div class="stat-row">
                    <span class="stat-name">{{ stat.stat.name }}</span>
                    <span class="stat-value">{{ stat.base_stat }}</span>
                    <div class="stat-bar-bg">
                      <!-- Max base stat is generally 255, so we calculate the percentage relative to that -->
                      <div class="stat-bar-fill" [style.width.%]="(stat.base_stat / 255) * 100"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .detail-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f2f5;
      }
      .header h2 { margin: 0; color: #333; }

      .app-nav-button {
        padding: 8px 16px;
        background-color: #ff5a3f;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s ease;
      }
      .app-nav-button:hover { background-color: #e04830; }

      .content-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 30px;
      }
      @media (max-width: 650px) {
        .content-grid { grid-template-columns: 1fr; }
      }

      .image-section {
        text-align: center;
        background-color: #f8f9fa;
        border-radius: 12px;
        padding: 20px;
      }
      .main-image {
        width: 200px;
        height: 200px;
        background-color: white;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        border: 4px solid #fff;
      }

      .info-section h3 {
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
        margin-top: 20px;
        color: #444;
      }

      .type-badge {
        display: inline-block;
        padding: 5px 12px;
        color: white;
        border-radius: 12px;
        margin-right: 8px;
        font-size: 14px;
        font-weight: bold;
        text-transform: capitalize;
      }

      .abilities-section ul { list-style-type: none; padding: 0; }
      .abilities-section li {
        background-color: #f0f4f8;
        margin-bottom: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        text-transform: capitalize;
      }
      .hidden-badge {
        font-size: 12px;
        background-color: #ccc;
        padding: 2px 6px;
        border-radius: 8px;
        margin-left: 8px;
      }

      .stats-grid { display: flex; flex-direction: column; gap: 8px; }
      .stat-row { display: flex; align-items: center; font-size: 14px; }
      .stat-name { width: 140px; text-transform: capitalize; font-weight: bold; color: #555; }
      .stat-value { width: 40px; text-align: right; margin-right: 15px; }
      .stat-bar-bg {
        flex: 1;
        height: 10px;
        background-color: #e0e0e0;
        border-radius: 5px;
        overflow: hidden;
      }
      .stat-bar-fill {
        height: 100%;
        background-color: #4caf50;
        border-radius: 5px;
      }
    `,
  ],
  // templateUrl: './pokemon-detail.html',
  // styleUrl: './pokemon-detail.css',
})
export class PokemonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pokemonService = inject(PokemonDataService);

  //
  id = input.required<string>();
  pokemon$ = this.route.params.pipe(
    switchMap((params) => this.pokemonService.getPokemonById(params['id'])),
  );
  //

  // pokemon$ = this.route.params.pipe(
  //   switchMap((params) => this.pokemonService.getPokemonById(params['id'])),
  // );

  goBack(id: string | number): void {
    this.router.navigate(['/pokemon-list'], { queryParams: { id } });
  }
  ngOnInit(): void { }

  convertHeight(height: number): string {
    return convertHeightToMeters(height).toFixed(2);
  }

  convertWeight(weight: number): string {
    return convertWeightToKilograms(weight).toFixed(2);
  }

  getTypeColor(type: string): string {
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
    return typeColors[type.toLowerCase()] || '#777777';
  }
}
