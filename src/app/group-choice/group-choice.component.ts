import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../socket.service";
import {Group} from "../model/group.model";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {TuiDialogService} from "@taiga-ui/core";
import {OrderStatus} from "../model/order.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {OrderService} from "../order.service";
import {UserService} from "../user.service";
import {TUI_DATE_FORMAT, TUI_DATE_SEPARATOR, TuiDay, TuiStringHandler, TuiValidationError} from "@taiga-ui/cdk";
import {TUI_PROMPT, TuiPromptData} from "@taiga-ui/kit";
import {Router} from "@angular/router";

@Component({
  selector: 'app-group-choice',
  templateUrl: './group-choice.component.html',
  styleUrls: ['./group-choice.component.css'],
  providers: [
    {provide: TUI_DATE_FORMAT, useValue: 'DMY'},
    {provide: TUI_DATE_SEPARATOR, useValue: '/'},
  ],
})
export class GroupChoiceComponent implements OnInit, OnDestroy {
  public title = 'Groupe';
  groups: Group[] = [];
  private subscription: Subscription | undefined;
  public loaded = false;
  private _groups$ = new BehaviorSubject<Group[]>([]);
  open = false;
  restoForm: FormControl = new FormControl(null, Validators.required);
  creneauxForm: FormControl = new FormControl(null, Validators.required);
  min = TuiDay.currentLocal();
  form = new FormGroup({
    resto: this.restoForm,
    date: new FormControl(TuiDay.currentLocal(), Validators.required),
    creneaux: this.creneauxForm,
  });
  restaurantsList: any[] = [];
  creneauxResult: any;
  creneaux: any[] = [];


  constructor(public socketService: SocketService, private orderService: OrderService, public userService: UserService, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService, private router: Router) {
  }

  ngOnInit(): void {
    this.socketService.getGroups();
    this.orderService.getRestaurantAddress() ? this.restoForm.setValue(this.orderService.getRestaurantAddress()) : this.restoForm.setValue('');
    this.subscription = this.socketService.groupsUpdate.subscribe(groups => {
      this.groups = groups;
      this._groups$.next(this.groups);
    });
    this.orderService.getRestaurantList().subscribe(restaurants => {
      this.restaurantsList = restaurants;
    });
    this.form.valueChanges.subscribe(value => {
      let date = null;
      if (value?.date) date = value?.date.toLocalNativeDate().toLocaleDateString().replaceAll('/', '%2F');
      if (this.restoForm.value.restaurant && date) {
        console.log(this.restoForm.value.restaurant, date);
        this.orderService.getHoraires(this.restoForm.value.restaurant, date).subscribe(horaires => {
          this.creneauxResult = horaires;
          this.creneaux = horaires.creneaux;
          console.log(this.creneauxResult);
        });
      }
    });
    this.form.controls.date.setValue(TuiDay.currentLocal());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected readonly OrderStatus = OrderStatus;

  stringify: TuiStringHandler<any> = restaurant => restaurant.name;

  stringifyCreneaux: TuiStringHandler<any> = creneaux => creneaux.libelle;

  showDialog(): void {
    this.open = true;
  }

  createGroup(observer: any): void {
    console.log('Test');
    if (this.form.valid) {
      this.userService.isUserInGroup(this.userService.userEmail).subscribe(response => {
        console.log(response);
        if (!response) {
          this.socketService.createGroup(this.restoForm.value, this.creneauxForm.value).subscribe(group => setTimeout(() => {
            observer.complete();
            this.router.navigate(['/order']);
          }));
        } else {
          const data: TuiPromptData = {
            content: "Vous faites déjà partie d'un groupe. Êtes-vous sûr de vouloir créer un autre groupe ?",
            yes: 'Oui',
            no: 'Non',
          };

          this.dialogs
            .open<boolean>(TUI_PROMPT, {
              label: 'Créer un nouveau groupe',
              size: 's',
              data,
            }).subscribe(value => {
            if (value) {
              this.socketService.createGroup(this.restoForm.value, this.creneauxForm.value).subscribe(group => setTimeout(() => {
                observer.complete();
                this.router.navigate(['/order']);
              }));
            }
          });
        }
      });
    }
  }

  libelleByRestaurantId(restaurantId: number): string {
    const resto = this.restaurantsList.find(r => r.id === restaurantId);
    return resto ? resto.libelle : '';
  }

  closeDialog(observer: any): void {
    observer.complete();
  }

  joinGroup(group: Group): void {
    this.userService.isUserInGroup(this.userService.userEmail).subscribe(response => {
      if (!response) {
        this.socketService.joinGroup(group.id);
        this.orderService.setGroup(group);
        this.router.navigate(['/order']);
      } else {
        const data: TuiPromptData = {
          content: "Vous faites déjà partie d'un groupe. Êtes-vous sûr de vouloir rejoindre un autre groupe ?",
          yes: 'Oui',
          no: 'Non',
        };

        this.dialogs
          .open<boolean>(TUI_PROMPT, {
            label: 'Rejoindre un nouveau groupe',
            size: 's',
            data,
          }).subscribe(value => {
          if (value) {
            this.socketService.joinGroup(group.id);
            this.orderService.setGroup(group);
            this.router.navigate(['/order']);
          }
        });
      }
    });
  }

  isUserInGroup(group: Group): boolean {
    return group.users.some(u => u.email === this.userService.userEmail) || group.host.email === this.userService.userEmail;
  }

  get dateError(): TuiValidationError | null {
    return this.form.controls.date.invalid ? new TuiValidationError('Date invalide') : this.creneauxResult?.resultat === 'ko' ? new TuiValidationError(this.creneauxResult.message) : null;
  }

  get restoError(): TuiValidationError | null {
    return this.form.controls.resto.invalid ? new TuiValidationError('Vous devez choisir une adresse de livraison') : null;
  }

  get formError(): TuiValidationError | null {
    return this.form.invalid ? new TuiValidationError('Veuillez correctement remplir les champs') : null;
  }

  get creneauxError(): TuiValidationError | null {
    return this.form.controls.creneaux.invalid ? new TuiValidationError('Vous devez choisir un créneau') : null;
  }
}
