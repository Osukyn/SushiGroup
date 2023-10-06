import {Observable, take} from "rxjs";
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from "@angular/router";
import {UserService} from "./user.service";
import {OrderService} from "./order.service";
import {Injectable} from "@angular/core";
import {LoaderService} from "./loader.service";

@Injectable({
  providedIn: 'root'
})
export class DataResolver implements Resolve<Observable<any>> {

  constructor(private orderService: OrderService,
              private userService: UserService,
              private loaderService: LoaderService,
              private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return new Observable(observer => {
      if (this.loaderService.dataResolved) {
        observer.next(true);
      } else {
        this.loaderService.show(); // Affiche le loader
        this.userService.setUp().pipe(take(1)).subscribe(() => {
          this.userService.isUserConnected().pipe(take(1)).subscribe(value => {
            if (!value) {
              this.loaderService.hide(); // Masque le loader
              observer.next(false);
              return;
            }
            this.orderService.getUserGroup().pipe(take(1)).subscribe((group) => {
              if (group) {
                this.orderService.setGroup(group);
                if (state.url === '/') this.router.navigate(['/order']);
                switch (state.url) {
                  case '/':
                  case '/group':
                    this.router.navigate(['/order']);
                    break;
                  default:
                    break;
                }
              } else {
                switch (state.url) {
                  case '/order':
                  case '/cart':
                  case '/recent':
                    this.router.navigate(['/']);
                    break;
                  default:
                    break;
                }
              }
              setTimeout(() => {
                this.loaderService.hide(); // Masque le loader
                this.loaderService.dataResolved = true;
                observer.next(true);
              }, 1000);
            });
          });
        });
      }

    });
  }
}