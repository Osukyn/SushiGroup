import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import {Observable, tap} from "rxjs";
import {Injectable} from "@angular/core";
import {AuthService} from "@auth0/auth0-angular";
import {LoaderService} from "./loader.service"; // Importez le service de loader

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
      private readonly auth: AuthService,
      private router: Router,
      private loaderService: LoaderService  // Injectez le service de loader
  ) {}

  canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    this.loaderService.show();  // Affichez le loader au début

    return this.auth.isAuthenticated$.pipe(
        tap((loggedIn) => {
          if (!loggedIn) {
            // redirect to the angular hello route with router state
            this.router.navigate(['/login']).then(r => console.log(r));
          }
        }),
        tap(() => this.loaderService.hide())  // Masquez le loader à la fin, que l'utilisateur soit connecté ou non
    );
  }
}
