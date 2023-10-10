import {ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {UserService} from "../user.service";
import {LoaderService} from "../loader.service";
import {TUI_PROMPT, TuiPromptData} from "@taiga-ui/kit";
import {TuiStringHandler} from "@taiga-ui/cdk";
import {Restaurant} from "../register/register.component";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {pairwise, startWith, Subject, takeUntil} from "rxjs";
import {OrderService} from "../order.service";
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProfileComponent {
  profile: any;
  title = 'Profil';
  loaded = false;
  isEditing = false;
  restaurantsList: any[] = [];
  opens: boolean[] = [];
  profileForm: FormGroup;
  tempProfileForm: FormGroup;
  private destroySubjects: Subject<boolean>[] = [];

  // Autres propriétés et méthodes...


  constructor(public userService: UserService, public auth: AuthService, private fb: FormBuilder, private orderService: OrderService, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService, private http: HttpClient, @Inject(TuiAlertService) private readonly alerts: TuiAlertService) {
    this.profile = this.userService.user;
    this.loaded = true;

    this.profileForm = this.fb.group({
      profilePicture: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      deliveriesInfos: this.fb.array([])
    });

    this.tempProfileForm = this.cloneFormGroup(this.profileForm);

    this.profileForm.controls['firstName'].setValue(this.userService.user?.firstName);
    this.profileForm.controls['lastName'].setValue(this.userService.user?.lastName);
    this.profileForm.controls['email'].setValue(this.userService.userEmail);
    this.profileForm.controls['profilePicture'].setValue(this.userService.userPicture);
    this.profileForm.controls['phone'].setValue(this.userService.user?.phone);
    this.orderService.getRestaurantList().subscribe(restaurants => {
      this.restaurantsList = restaurants;
    });
    this.initializeDeliveriesInfos(this.userService.user?.deliveriesInfos);
  }

  logout(): void {
    // @ts-ignore
    this.auth.logout({ returnTo: window.location.origin });
  }

  toggleEdit() {
    if (this.isEditing) {
      // Copier la valeur ET la structure de tempProfileForm vers profileForm
      this.copyFormStructure(this.tempProfileForm, this.profileForm);
    } else {
      // Copier la valeur ET la structure de profileForm vers tempProfileForm
      this.copyFormStructure(this.profileForm, this.tempProfileForm);
    }

    //console.log(this.profileForm.value);
    this.isEditing = !this.isEditing;
  }

  copyFormStructure(source: FormGroup, target: FormGroup) {
    // Copier les valeurs simples
    target.patchValue(source.value);
    console.log(target.value);

    const sourceDeliveries = source.get('deliveriesInfos') as FormArray;
    const targetDeliveries = target.get('deliveriesInfos') as FormArray;

    console.log(sourceDeliveries);
    console.log(targetDeliveries);

    if (!sourceDeliveries || !targetDeliveries) {
      console.error('Error: deliveriesInfos not found in one of the forms');
      return;
    }

    // Supprimer tous les éléments existants de targetDeliveries
    while (targetDeliveries.length) {
      targetDeliveries.removeAt(0);
    }

    // Ajouter des éléments de sourceDeliveries à targetDeliveries
    sourceDeliveries.controls.forEach(control => {
      targetDeliveries.push(this.fb.group(control.value)); // ici, on pourrait également copier les validateurs si nécessaire
    });
  }


  cloneFormGroup(source: FormGroup): FormGroup {
    const clone = new FormGroup({});
    Object.keys(source.controls).forEach(key => {
      const control = source.controls[key];
      if (control instanceof FormControl) {
        clone.addControl(key, new FormControl(control.value));
      } else if (control instanceof FormGroup) {
        clone.addControl(key, this.cloneFormGroup(control));
      } else if (control instanceof FormArray) {
        clone.addControl(key, this.cloneFormArray(control));
      }
    });
    return clone;
  }

  cloneFormArray(source: FormArray): FormArray {
    const clone: FormArray<any> = new FormArray([] as any);
    source.controls.forEach(control => {
      if (control instanceof FormControl) {
        clone.push(new FormControl(control.value));
      } else if (control instanceof FormGroup) {
        clone.push(this.cloneFormGroup(control));
      } else if (control instanceof FormArray) {
        clone.push(this.cloneFormArray(control));
      }
    });
    return clone;
  }



  saveChanges() {
    // Validez le formulaire, sauvegardez les modifications, etc.
    if (this.profileForm.valid) {
      console.log(this.profileForm.value);
      this.http.put(`${environment.baseUrl}${environment.restPort}/api/user`, this.profileForm.value).subscribe(value => {
        console.log('Mis à jour !', value);
        this.alerts
          .open('Votre profil a été mis à jour avec succès', {label: 'Succès', status: 'success', hasCloseButton: false})
          .subscribe();
      });
      this.isEditing = false;
      // Faites quelque chose avec les données du formulaire, par exemple les envoyer à une API.
    } else {
      console.log('Formulaire invalide');
      console.log(this.profileForm.value);
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
        this.profileForm.controls['profilePicture'].setValue('');
        //this.ref.markForCheck();
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

  get restaurants(): FormArray {
    return this.profileForm.get('deliveriesInfos') as FormArray;
  }

  initializeDeliveriesInfos(existingData: [any] | undefined) {
    if (!existingData) return;
    for (const data of existingData) {
      this.addRestaurant(data);
    }
  }

// 3. Modifiez votre méthode createRestaurant()
  createRestaurant(data: any = null): FormGroup {
    const initData = {
      name: data ? data.name : '',
      restaurant: data ? data.restaurant : null,
      sousLieux: data ? data.sousLieux : '',
      address: data ? data.address : '',
      address2: data ? data.address2 : ''
    };

    const resto = this.fb.group({
      name: [initData.name, Validators.required],
      restaurant: [initData.restaurant, Validators.required],
      sousLieux: [initData.sousLieux],
      address: [initData.address, Validators.required],
      address2: [initData.address2]
    });

    const destroyForThisResto$ = new Subject<boolean>();

    resto.get('restaurant')?.valueChanges
      .pipe(startWith(null as unknown as string), pairwise(), takeUntil(destroyForThisResto$))
      .subscribe(([prev, next]: [any, any]) => {
        if (prev) this.onRestaurantChange(prev);
      });

    this.destroySubjects.push(destroyForThisResto$);

    return resto;
  }

  addRestaurant(data: any = null): void {
    if (data) this.opens.push(false);
    else this.opens.push(true);
    this.restaurants.push(this.createRestaurant(data));
  }

  removeRestaurant(index: number): void {
    // Lors de la suppression d'un restaurant, terminez l'observable
    this.destroySubjects[index].next(true);
    this.destroySubjects[index].complete();
    this.destroySubjects.splice(index, 1);

    this.opens.splice(index, 1);
    this.restaurants.removeAt(index);
  }
}
