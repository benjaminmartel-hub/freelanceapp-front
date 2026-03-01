import { Directive, input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appRoleAccess]'
})

// Affiche/masque du template selon des rôles.
export class RoleAccessDirective {
  readonly appRoleAccess = input.required<string[]>();

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    // Dans l’état actuel, ce bouton s’affichera dès que la liste n’est pas vide, même si l’utilisateur n’est pas admin.
    // A compléter (connexion à un service d’auth/roles).
    if (this.appRoleAccess().length > 0) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}
