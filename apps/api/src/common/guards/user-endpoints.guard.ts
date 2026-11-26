import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Garde des routes qui prennent un `userId` dans l'URL (favoris, listes,
 * historique de recherche).
 *
 * L'API n'a pas encore d'authentification : n'importe qui pourrait lire ou
 * modifier les données d'un autre utilisateur en changeant l'identifiant dans
 * l'URL. Ces routes sont donc fermées en production par défaut, et ouvertes
 * en développement pour ne pas bloquer le travail.
 *
 * À remplacer par une vraie vérification d'identité (session NextAuth / JWT)
 * avant toute mise en production de ces fonctionnalités.
 */
@Injectable()
export class UserEndpointsGuard implements CanActivate {
  canActivate(): boolean {
    const isProduction = process.env.NODE_ENV === 'production';
    const explicitlyAllowed = process.env.ALLOW_UNAUTHENTICATED_USER_ENDPOINTS === 'true';
    if (isProduction && !explicitlyAllowed) {
      throw new ForbiddenException(
        'Routes utilisateur désactivées : authentification non implémentée.'
      );
    }
    return true;
  }
}
