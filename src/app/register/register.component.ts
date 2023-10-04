import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {TuiDialogService} from "@taiga-ui/core";
import {TUI_PROMPT, tuiItemsHandlersProvider, TuiPromptData} from "@taiga-ui/kit";
import {find, pairwise, startWith, switchMap} from "rxjs";
import {UserService} from "../user.service";
import {OrderService} from "../order.service";
import {TuiStringHandler} from "@taiga-ui/cdk";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {LoaderService} from "../loader.service";
import {environment} from "../../environments/environment";

export interface Restaurant {
  id: number;
  libelle: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnDestroy{
  registrationForm: FormGroup;
  opens: boolean[] = [];
  restaurantsList: any[] = [];
  open = false;
  oldValue = null;
  title = 'Inscription';
  private subscription: any;

  constructor(private fb: FormBuilder,
              @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
              private userService: UserService,
              private ref: ChangeDetectorRef,
              private orderService: OrderService,
              private http: HttpClient,
              private router: Router,
              private loaderService: LoaderService) {
    this.registrationForm = this.fb.group({
      profilePicture: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      name: ['', Validators.required],
      deliveriesInfos: this.fb.array([])
    });

    this.subscription = this.loaderService.isLoading.subscribe(value => {
      console.log(this.userService.user);
      this.registrationForm.controls['name'].setValue(this.userService.userName);
      this.registrationForm.controls['email'].setValue(this.userService.userEmail);
      this.registrationForm.controls['profilePicture'].setValue(this.userService.userPicture);
      this.orderService.getRestaurantList().subscribe(restaurants => {
        this.restaurantsList = restaurants;
      });
    });
  }

  get restaurants(): FormArray {
    return this.registrationForm.get('deliveriesInfos') as FormArray;
  }

  createRestaurant(): FormGroup {
    const resto = this.fb.group({
      name: ['', Validators.required],
      restaurant: [null, Validators.required],
      sousLieux: [''],
      address: ['', Validators.required],
      address2: ['']
    });

    resto.get('restaurant')?.valueChanges
      .pipe(startWith(null as unknown as string), pairwise())
      .subscribe(([prev, next]: [any, any]) => {
        if (prev) this.onRestaurantChange(prev);
      });

    return resto;
  }

  addRestaurant(): void {
    this.opens.push(true);
    this.restaurants.push(this.createRestaurant());
  }

  removeRestaurant(index: number): void {
    this.restaurants.removeAt(index);
    this.opens.splice(index, 1);
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      console.log(this.registrationForm.value);
      this.http.post(`${environment.baseUrl}${environment.restPort}/api/register`, this.registrationForm.value).subscribe(value => {
        console.log('Inscription réussie !', value);
        this.router.navigate(['/']);
      });
      // Faites quelque chose avec les données du formulaire, par exemple les envoyer à une API.
    } else {
      // Affichez un message d'erreur
      console.log('Formulaire invalide');
      console.log(this.registrationForm.value);
    }
  }

  removePhoto(): void {
    const data: TuiPromptData = {
      content:
        "Il n'est pas encore possible de changer la photo de profil. La suppression est donc définitive. Voulez-vous continuer ?",
      yes: 'Oui',
      no: 'Non',
    };

    this.dialogs
      .open<boolean>(TUI_PROMPT, {
        label: 'Êtes-vous sûr de vouloir supprimer cette photo ?',
        size: 's',
        data,
      }).subscribe(value => {
      if (value) {
        this.registrationForm.controls['profilePicture'].setValue('');
        this.ref.markForCheck();
      }
    });
  }

  findSousLieux(restaurant: any): any[] {
    if (restaurant === null) return [];
    let found = this.restaurantsList.find(r => r.id === restaurant);
    if (found) {
      found = JSON.parse(found.sousLieux);
      return found;
    } else return [];
  }

  stringify: TuiStringHandler<Restaurant> = restaurant => {
    const found = this.restaurantsList.find(r => r.id === restaurant);
    if (found) {
      return found.libelle;
    } else {
      return '';
    }
  };

  onRestaurantChange(i: number) {
    this.findControl(i)?.setValue('', {emitEvent: false});
  }

  findControl(id: number): any {
    const found = this.restaurants.controls.find(c => c.value.restaurant === id);
    if (found) return found.get('sousLieux');
    else return null;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
