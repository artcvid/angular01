import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PokemonListComponent } from './features/pokemon-list';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PokemonListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular01');
}