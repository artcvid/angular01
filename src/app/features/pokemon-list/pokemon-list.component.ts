/**
 * Pokemon List Component - Presentation Logic
 * Single Responsibility: Display Pokemon data and handle user interactions
 */

import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  DestroyRef,
  signal,
  computed,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [NavButton, CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container py-5" style="max-width: 550px;">
      <h1 class="text-center mb-5 display-4 fw-black pokemon-title">Poké-Explorer</h1>

      <div class="d-flex justify-content-center gap-3 mb-5">
        <button
          class="btn btn-danger btn-lg fw-bold rounded-pill px-4 border border-3 border-dark shadow d-flex align-items-center gap-2"
          style="background-color: #ff3334;"
          (click)="onLoadRandomPokemon()"
        >
          Random
        </button>
        <button
          class="btn btn-warning text-dark btn-lg fw-bold rounded-pill px-4 border border-3 border-dark shadow d-flex align-items-center gap-2"
          style="background-color: #ffcb05;"
          (click)="onSearchPikachu()"
        >
          Pikachu
        </button>
      </div>

      <form (ngSubmit)="onSearchPokemon()" class="mb-4 d-flex justify-content-center">
        <div class="input-group" style="max-width: 300px;">
          <input
            type="text"
            [(ngModel)]="searchPokemonName"
            name="pokemonName"
            placeholder="Ingresa el nombre del Pokémon"
            class="form-control rounded-start-pill border-dark border-3"
          />
          <button
            type="submit"
            class="btn btn-primary rounded-end-pill border-dark border-3 shadow"
          >
            Buscar
          </button>
        </div>
      </form>

      <form
        [formGroup]="advancedSearchForm"
        (ngSubmit)="onSubmitAdvancedSearch()"
        class="advanced-search-form"
      >
        <h3>Búsqueda Avanzada</h3>
        <div class="form-group">
          <label>
            <input type="radio" formControlName="searchType" value="name" class="radio-input" />
            Buscar por Nombre
          </label>
          <label>
            <input type="radio" formControlName="searchType" value="id" class="radio-input" />
            Buscar por ID
          </label>
        </div>
        @if (advancedSearchForm.value.searchType === 'name') {
          <div class="form-field">
            <input
              type="text"
              formControlName="pokemonName"
              placeholder="Ej: charizard, dragonite"
              class="form-control"
            />
            @if (
              advancedSearchForm.get('pokemonName')?.hasError('required') &&
              advancedSearchForm.get('pokemonName')?.touched
            ) {
              <span class="error-message">El nombre es requerido</span>
            }
          </div>
        }
        @if (advancedSearchForm.value.searchType === 'id') {
          <div class="form-field">
            <input
              type="number"
              formControlName="pokemonId"
              placeholder="Ej: 1 a 1025"
              class="form-control"
            />
            @if (
              advancedSearchForm.get('pokemonId')?.hasError('required') &&
              advancedSearchForm.get('pokemonId')?.touched
            ) {
              <span class="error-message">El ID es requerido</span>
            }
            @if (advancedSearchForm.get('pokemonId')?.hasError('min')) {
              <span class="error-message">El ID debe ser mayor a 0</span>
            }
            @if (advancedSearchForm.get('pokemonId')?.hasError('max')) {
              <span class="error-message">El ID debe ser menor o igual a 1025</span>
            }
          </div>
        }
        <button type="submit" [disabled]="advancedSearchForm.invalid" class="submit-button">
          Buscar Pokémon
        </button>
      </form>

      <!-- SIGNAL FORMS - BÚSQUEDA ULTRA AVANZADA -->
      <form (ngSubmit)="onSubmitSignalSearch()" class="signal-search-form">
        <h3>Búsqueda Ultra Avanzada (Signal Forms)</h3>
        <div class="signal-form-group">
          <label class="signal-radio-label">
            <input
              type="radio"
              [checked]="signalSearchType() === 'name'"
              (change)="updateSignalSearchType('name')"
              class="signal-radio-input"
            />
            <span class="radio-text">Buscar por Nombre</span></label
          >
          <label class="signal-radio-label">
            <input
              type="radio"
              [checked]="signalSearchType() === 'id'"
              (change)="updateSignalSearchType('id')"
              class="signal-radio-input"
            />
            <span class="radio-text">Buscar por ID</span>
          </label>
        </div>
        @if (signalSearchType() === 'name') {
          <div class="signal-form-field">
            <input
              type="text"
              [value]="signalPokemonName()"
              (input)="updateSignalPokemonName($any($event.target).value)"
              placeholder="Ej: charizard, dragonite, pikachu"
              class="signal-form-control"
            />
          </div>
        }
        @if (signalSearchType() === 'id') {
          <div class="signal-form-field">
            <input
              type="number"
              [value]="signalPokemonId()"
              (input)="updateSignalPokemonId($any($event.target).value)"
              placeholder="Ej: 1 a 1025"
              class="signal-form-control"
            />
          </div>
        }
        <!-- Mostrar errores usando computed signal -->
        @if (signalFormErrors().length > 0) {
          <div class="signal-errors">
            @for (error of signalFormErrors(); track error) {
              <span class="signal-error-message">{{ error }}</span>
            }
          </div>
        }
        <button type="submit" [disabled]="!isSignalFormValid()" class="signal-submit-button">
          Buscar con Signals
        </button>
      </form>

      <!-- @let pokemon = (pokemon$ | async); -->
      @if (state.pokemon) {
        <div
          class="card pokemon-card border-4 border-dark rounded-5 overflow-hidden shadow-lg mx-auto"
          style="max-width: 420px; background-color: #f8f9fa;"
        >
          <!-- Image Section  -->
          <div
            class="position-relative text-center pt-5 pb-4 img-backdrop"
            [style.backgroundColor]="getTypeColor(state.pokemon.types[0].type.name)"
          >
            <span
              class="position-absolute top-0 start-0 m-3 badge bg-white text-dark border border-2 border-dark fs-5 rounded-pill shadow-sm"
            >
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
          <div
            class="card-body p-4 bg-white text-center position-relative card-overlap border-top border-4 border-dark"
          >
            <h2 class="card-title text-capitalize fw-black mb-3 display-6">
              {{ formatName(state.pokemon.name) }}
            </h2>

            <div class="d-flex justify-content-center gap-2 mb-4">
              @for (type of state.pokemon.types; track type.type.name) {
                <span
                  class="badge rounded-pill border border-2 border-dark text-capitalize px-3 py-2 fs-6 shadow-sm"
                  [style.backgroundColor]="getTypeColor(type.type.name)"
                >
                  {{ type.type.name }}
                </span>
              }
            </div>

            <div class="row g-2 mb-4 px-3">
              <div class="col-6">
                <div
                  class="bg-light border border-2 border-secondary rounded-4 p-2 shadow-sm stat-box"
                >
                  <div class="text-muted small fw-bold text-uppercase">Altura</div>
                  <div class="fw-bold fs-5">
                    {{ convertHeight(state.pokemon.height) }} <span class="fs-6 text-muted">m</span>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div
                  class="bg-light border border-2 border-secondary rounded-4 p-2 shadow-sm stat-box"
                >
                  <div class="text-muted small fw-bold text-uppercase">Peso</div>
                  <div class="fw-bold fs-5">
                    {{ convertWeight(state.pokemon.weight) }}
                    <span class="fs-6 text-muted">kg</span>
                  </div>
                </div>
              </div>
            </div>

            <app-nav-button
              [pokemonId]="state.pokemon.id"
              text="View Details"
              url="/pokemon-list"
            ></app-nav-button>
          </div>
        </div>

        <div class="d-flex justify-content-center align-items-center gap-3 mt-5">
          <button
            class="btn btn-dark fw-bold rounded-circle border border-3 border-secondary shadow nav-ctrl d-flex align-items-center justify-content-center"
            style="width: 50px; height: 50px; background-color: #4a4a4a;"
            (click)="goFirst()"
          >
            <<
          </button>
          <button
            class="btn border border-3 border-dark shadow nav-ctrl d-flex align-items-center justify-content-center fs-4"
            style="width: 65px; height: 50px; background-color: #e74c3c; color: white; border-radius: 15px;"
            (click)="goBack(state.pokemon.id)"
          >
            <
          </button>
          <button
            class="btn border border-3 border-dark shadow nav-ctrl d-flex align-items-center justify-content-center fs-4"
            style="width: 65px; height: 50px; background-color: #2ecc71; color: white; border-radius: 15px;"
            (click)="goForward(state.pokemon.id)"
          >
            >
          </button>
          <button
            class="btn btn-dark fw-bold rounded-circle border border-3 border-secondary shadow nav-ctrl d-flex align-items-center justify-content-center"
            style="width: 50px; height: 50px; background-color: #4a4a4a;"
            (click)="goLast()"
          >
            >>
          </button>
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
        text-shadow:
          3px 3px 0 #3b4cca,
          6px 6px 0 #000;
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
        box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.25) !important;
      }

      .img-backdrop {
        box-shadow: inset 0 -15px 20px rgba(0, 0, 0, 0.1);
        transition: background-color 0.4s ease;
      }

      .sprite-container {
        width: 180px;
        height: 180px;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.8) 0%,
          rgba(255, 255, 255, 0) 70%
        );
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
        filter: drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.6));
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .pokemon-card:hover .pokemon-img {
        transform: scale(1.2) rotate(4deg);
      }

      .nav-ctrl {
        transition:
          transform 0.1s ease,
          box-shadow 0.1s ease,
          background-color 0.2s ease;
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

      .advanced-search-form {
        margin: 30px 0;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
      }
      .advanced-search-form h3 {
        margin: 0 0 15px 0;
        color: white;
        font-size: 18px;
        text-align: center;
      }
      .form-group {
        display: flex;
        gap: 25px;
        margin-bottom: 20px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .form-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: white;
        cursor: pointer;
        font-weight: 500;
      }
      .radio-input {
        cursor: pointer;
        width: 18px;
        height: 18px;
        accent-color: #4caf50;
      }
      .form-field {
        margin-bottom: 15px;
      }
      .advanced-search-form .form-control {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid transparent;
        border-radius: 4px;
        font-size: 14px;
        font-family: Arial, sans-serif;
        transition: all 0.3s ease;
        background-color: white;
      }
      .advanced-search-form .form-control:focus {
        outline: none;
        border-color: #4caf50;
        box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
      }
      .advanced-search-form .form-control::placeholder {
        color: #bbb;
      }
      .error-message {
        display: block;
        color: #ffeb3b;
        font-size: 12px;
        margin-top: 5px;
        font-weight: bold;
      }
      .submit-button {
        width: 100%;
        padding: 12px 20px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.3s ease;
      }
      .submit-button:hover:not(:disabled) {
        background-color: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      .submit-button:active:not(:disabled) {
        transform: translateY(0);
      }
      .submit-button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
      }

      /* SIGNAL FORMS - BÚSQUEDA ULTRA AVANZADA */
      .signal-search-form {
        margin: 40px 0;
        padding: 25px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.1);
      }
      .signal-search-form h3 {
        margin: 0 0 20px 0;
        color: white;
        font-size: 20px;
        text-align: center;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      .signal-form-group {
        display: flex;
        gap: 30px;
        margin-bottom: 25px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .signal-radio-label {
        display: flex;
        align-items: center;
        gap: 10px;
        color: white;
        cursor: pointer;
        font-weight: 600;
        padding: 8px 12px;
        border-radius: 20px;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      }
      .signal-radio-label:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
      .signal-radio-input {
        cursor: pointer;
        width: 20px;
        height: 20px;
        accent-color: #ffd93d;
        filter: brightness(1.2);
      }
      .radio-text {
        font-size: 15px;
        user-select: none;
      }
      .signal-form-field {
        margin-bottom: 20px;
      }
      .signal-form-control {
        width: 100%;
        padding: 15px 18px;
        border: 3px solid transparent;
        border-radius: 8px;
        font-size: 16px;
        font-family: Arial, sans-serif;
        font-weight: 500;
        transition: all 0.3s ease;
        background-color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .signal-form-control:focus {
        outline: none;
        border-color: #ffd93d;
        box-shadow: 0 0 0 4px rgba(255, 217, 61, 0.3);
        transform: scale(1.02);
      }
      .signal-form-control::placeholder {
        color: #999;
        font-weight: 400;
      }
      .signal-errors {
        margin-bottom: 20px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 6px;
        border-left: 4px solid #ff6b6b;
      }
      .signal-error-message {
        display: block;
        color: #d32f2f;
        font-size: 13px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .signal-error-message:last-child {
        margin-bottom: 0;
      }
      .signal-submit-button {
        width: 100%;
        padding: 15px 25px;
        background: linear-gradient(135deg, #ffd93d 0%, #ffb347 100%);
        color: #333;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(255, 217, 61, 0.4);
      }
      .signal-submit-button:hover:not(:disabled) {
        background: linear-gradient(135deg, #ffb347 0%, #ff8c00 100%);
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(255, 217, 61, 0.6);
      }
      .signal-submit-button:active:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 2px 10px rgba(255, 217, 61, 0.4);
      }
      .signal-submit-button:disabled {
        background: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
        transform: none;
        box-shadow: none;
      }
    `,
  ],
})
export class PokemonListComponent implements OnInit {
  private readonly pokemonDataService = inject(PokemonDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  protected state: PokemonListState = { ...INITIAL_POKEMON_LIST_STATE };
  protected searchPokemonName: string = '';
  protected advancedSearchForm!: FormGroup;

  // Señales para el estado del formulario
  protected signalSearchType = signal<'name' | 'id'>('name');
  protected signalPokemonName = signal('');
  protected signalPokemonId = signal<number | null>(null);
  // Señales computadas para validaciones y errores
  protected isSignalFormValid = computed(() => {
    const searchType = this.signalSearchType();
    const name = this.signalPokemonName();
    const id = this.signalPokemonId();
    if (searchType === 'name') {
      return name.trim().length > 0;
    } else {
      return id !== null && id >= 1 && id <= 1025;
    }
  });
  protected signalFormErrors = computed(() => {
    const searchType = this.signalSearchType();
    const name = this.signalPokemonName();
    const id = this.signalPokemonId();
    const errors: string[] = [];
    if (searchType === 'name' && name.trim().length === 0) {
      errors.push('El nombre del Pokémon es requerido');
    }
    if (searchType === 'id') {
      if (id === null) {
        errors.push('El ID del Pokémon es requerido');
      } else if (id < 1) {
        errors.push('El ID debe ser mayor a 0');
      } else if (id > 1025) {
        errors.push('El ID debe ser menor o igual a 1025');
      }
    }
    return errors;
  });

  ngOnInit(): void {
    // this.route.params.pipe(
    //   switchMap((params) => this.pokemonDataService.getPokemonById(params['id'])),
    // );
    this.initializeAdvancedSearchForm();
    this.route.queryParams.subscribe((params) => {
      const pokemonId = params['id'];
      if (pokemonId) {
        this.loadPokemon(() => this.pokemonDataService.getPokemonById(pokemonId));
      }
    });
  }

  private initializeAdvancedSearchForm(): void {
    this.advancedSearchForm = this.formBuilder.group({
      searchType: ['name', Validators.required],
      pokemonName: ['', Validators.minLength(1)],
      pokemonId: ['', [Validators.min(1), Validators.max(1025)]],
    });
    // Actualizar validadores dinámicamente basado en el tipo de búsqueda
    this.advancedSearchForm
      .get('searchType')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchType: string) => {
        const pokemonNameControl = this.advancedSearchForm.get('pokemonName');
        const pokemonIdControl = this.advancedSearchForm.get('pokemonId');
        if (searchType === 'name') {
          pokemonNameControl?.setValidators([Validators.required, Validators.minLength(1)]);
          pokemonIdControl?.setValidators([]);
        } else if (searchType === 'id') {
          pokemonNameControl?.setValidators([]);
          pokemonIdControl?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(1025),
          ]);
        }
        pokemonNameControl?.updateValueAndValidity();
        pokemonIdControl?.updateValueAndValidity();
      });
  }

  pokemon$ = this.route.params.pipe(
    switchMap((params) => this.pokemonDataService.getPokemonById(params['id'])),
  );

  goBack(pokemonId: string | number): void {
    const id = <number>pokemonId - 1;
    this.router.navigate([], { queryParams: { id } });
  }

  goForward(pokemonId: string | number): void {
    const id = <number>pokemonId + 1;
    this.router.navigate([], { queryParams: { id } });
  }

  goFirst(): void {
    this.router.navigate([], { queryParams: { id: 1 } });
  }

  goLast(): void {
    this.router.navigate([], { queryParams: { id: 1025 } });
  }

  onLoadRandomPokemon(id: number = generateRandomPokemonId()): void {
    this.router.navigate([], { queryParams: { id } });
  }

  onSearchPikachu(): void {
    this.router.navigate([], { queryParams: { id: 'pikachu' } });
  }

  onSearchPokemon(): void {
    if (this.searchPokemonName.trim()) {
      this.loadPokemon(() =>
        this.pokemonDataService.getPokemonByName(this.searchPokemonName.trim().toLowerCase()),
      );
    }
  }

  onSubmitAdvancedSearch(): void {
    if (this.advancedSearchForm.invalid) {
      return;
    }
    const { searchType, pokemonName, pokemonId } = this.advancedSearchForm.value;
    if (searchType === 'name' && pokemonName.trim()) {
      this.loadPokemon(() =>
        this.pokemonDataService.getPokemonByName(pokemonName.trim().toLowerCase()),
      );
    } else if (searchType === 'id' && pokemonId) {
      this.loadPokemon(() => this.pokemonDataService.getPokemonById(Number(pokemonId)));
    }
  }

  // SIGNAL FORMS - MÉTODO PARA ENVÍO
  onSubmitSignalSearch(): void {
    if (!this.isSignalFormValid()) {
      return;
    }
    const searchType = this.signalSearchType();
    const name = this.signalPokemonName();
    const id = this.signalPokemonId();
    if (searchType === 'name' && name.trim()) {
      this.loadPokemon(() => this.pokemonDataService.getPokemonByName(name.trim().toLowerCase()));
    } else if (searchType === 'id' && id) {
      this.loadPokemon(() => this.pokemonDataService.getPokemonById(id));
    }
  }
  // SIGNAL FORMS - MÉTODOS PARA ACTUALIZAR SIGNALS
  updateSignalSearchType(type: 'name' | 'id'): void {
    this.signalSearchType.set(type);
  }
  updateSignalPokemonName(name: string): void {
    this.signalPokemonName.set(name);
  }
  updateSignalPokemonId(id: string): void {
    const numId = id ? parseInt(id, 10) : null;
    this.signalPokemonId.set(numId);
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
