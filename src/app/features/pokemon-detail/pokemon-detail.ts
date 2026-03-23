import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonDataService } from '../../data/services';
import { Pokemon } from '../../shared/models';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';
import { input } from '@angular/core';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule],
  template: `

    @let pokemon = (pokemon$ | async);
    @if (pokemon) {
      <div class="detail-container">
        <button class="app-nav-button" (click)="goBack(pokemon.id)">← Atrás</button>
        <h2>{{ pokemon.name | uppercase }}</h2>
        <img [src]="pokemon.sprites.front_default" [alt]="pokemon.name" />
        <p><strong>ID:</strong> {{ pokemon.id }}</p>
        <p><strong>Altura:</strong> {{ pokemon.height }} dm</p>
        <p><strong>Peso:</strong> {{ pokemon.weight }} hg</p>
        <p>
          <strong>Tipos:</strong>
          @for (type of pokemon.types; track type.type.name) {
            <span class="type-badge">{{ type.type.name }}</span>
          }
        </p>
      </div>
    }
  `,
  styles: [
    `
      .detail-container {
        padding: 20px;
        max-width: 600px;
        margin: 0 auto;
      }
      .app-nav-button {
        padding: 10px 20px;
        background-color: #ff5a3f;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 20px;
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
}
