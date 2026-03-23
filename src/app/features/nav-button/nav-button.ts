import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-button',
  standalone: true,
  imports: [],
  template: `<button (click)="navigateToPokemonDetail()">{{text}}</button>`,
  styles: [
    `
      button {
        padding: 8px 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 10px;
      }
      button:hover {
        background-color: #0056b3;
      }
    `,
  ],
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
