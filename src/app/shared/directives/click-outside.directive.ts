import { Directive, ElementRef, HostListener, input, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})

// Détecte un clic en dehors de l’élément hôte.
// Exemple d'utilisation : fermer dropdown, modale, menu contextuel, etc.
export class ClickOutsideDirective {
  readonly appClickOutsideEnabled = input(true);
  readonly appClickOutsideInsideSelector = input<string | null>(null);
  readonly appClickOutside = output<void>();

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.appClickOutsideEnabled()) {
      return;
    }
    const node = target as Node | null;
    if (!node) {
      return;
    }

    const insideSelector = this.appClickOutsideInsideSelector();
    if (insideSelector) {
      const insideElement = document.querySelector(insideSelector);
      if (insideElement?.contains(node)) {
        return;
      }
    }

    const clickedInside = this.elementRef.nativeElement.contains(node);
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}
