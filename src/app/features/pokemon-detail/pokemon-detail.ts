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
      <div class="container my-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <h2 class="card-title mb-0 text-capitalize">{{ pokemon.name }} (#{{ pokemon.id }})</h2>
              <button class="btn btn-outline-secondary" (click)="goBack(pokemon.id)">← Back</button>
            </div>

            <div class="row">
              <div class="col-lg-4 text-center">
                <img [src]="pokemon.sprites.front_default" [alt]="pokemon.name" class="img-fluid rounded-circle bg-light p-3 mb-3 shadow-sm" style="width: 200px; height: 200px; object-fit: cover;"/>
                
                <div class="mb-3">
                  @for (type of pokemon.types; track type.type.name) {
                    <span class="badge rounded-pill me-1 p-2 text-capitalize" [style.backgroundColor]="getTypeColor(type.type.name)">{{ type.type.name }}</span>
                  }
                </div>

                <ul class="list-group list-group-flush text-start">
                  <li class="list-group-item"><strong>Base Exp:</strong> {{ pokemon.base_experience }}</li>
                  <li class="list-group-item"><strong>Height:</strong> {{ convertHeight(pokemon.height) }} m</li>
                  <li class="list-group-item"><strong>Weight:</strong> {{ convertWeight(pokemon.weight) }} kg</li>
                </ul>
              </div>

              <div class="col-lg-8">
                <h5>Abilities</h5>
                <ul class="list-group mb-4">
                  @for (ability of pokemon.abilities; track ability.ability.name) {
                    <li class="list-group-item d-flex justify-content-between align-items-center text-capitalize">
                      {{ ability.ability.name }}
                      @if (ability.is_hidden) { <span class="badge bg-dark rounded-pill">Hidden</span> }
                    </li>
                  }
                </ul>

                <h5>Base Stats</h5>
                @for (stat of pokemon.stats; track stat.stat.name) {
                  <div class="mb-2">
                    <label class="form-label text-capitalize d-flex justify-content-between">
                      <span>{{ stat.stat.name }}</span>
                      <strong>{{ stat.base_stat }}</strong>
                    </label>
                    <div class="progress" style="height: 20px;">
                      <div 
                        class="progress-bar" 
                        [class]="getStatColor(stat.stat.name)"
                        role="progressbar" 
                        [style.width.%]="(stat.base_stat / 255) * 100" 
                        [attr.aria-valuenow]="stat.base_stat" 
                        aria-valuemin="0" 
                        aria-valuemax="255">
                      </div>
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
    // All custom styles are removed and replaced by Bootstrap utility classes in the template.
    // A few minor inline styles are used for dynamic properties or specific sizing.
    `
      .progress-bar {
        transition: width 0.5s ease-in-out;
      }
    `
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
    this.router.navigate(['/pokemon-list'], { queryParams: { id: id } });
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

  protected getStatColor(statName: string): string {
    switch (statName) {
      case 'hp': return 'bg-success';
      case 'attack': return 'bg-danger';
      case 'defense': return 'bg-info';
      case 'special-attack': return 'bg-warning text-dark';
      case 'special-defense': return 'bg-primary';
      case 'speed': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }
}
