import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-button',
  standalone: true,
  imports: [],
  template: `<button class="btn btn-outline-primary fw-bold rounded-pill mt-2 px-4 shadow-sm" (click)="navigateToPokemonDetail()">{{text}}</button>`,
  styles: [],
})
export class NavButton {
  @Input()
  pokemonId!: string | number;
  @Input() text: string = 'Button';
  @Input()
  url!: string;


  private router = inject(Router);

  navigateToPokemonDetail() {
    if (this.pokemonId) {
      this.router.navigate([this.url, this.pokemonId]);
    }
  }
}
