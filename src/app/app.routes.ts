import { Routes } from '@angular/router';
import { PokemonListComponent } from './features/pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from './features/pokemon-detail/pokemon-detail';
export const routes: Routes = [
    { path: '', redirectTo: 'pokemon-list', pathMatch: 'full' },
    { path: 'pokemon-list', component: PokemonListComponent },
    { path: 'pokemon-list/:id', component: PokemonDetailComponent },
    { path: '**', redirectTo: 'pokemon-list' }
];