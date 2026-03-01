import { Directive, ElementRef, HostListener, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})

// Détecte un clic en dehors de l’élément hôte.
// Exemple d'utilisation : fermer dropdown, modale, menu contextuel, etc.
export class ClickOutsideDirective {
  readonly appClickOutside = output<void>();

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    const clickedInside = this.elementRef.nativeElement.contains(target as Node);
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}
