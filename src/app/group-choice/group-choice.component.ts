import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../socket.service";
import {Group} from "../model/group.model";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {TuiDialogService} from "@taiga-ui/core";
import {OrderStatus} from "../model/order.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {OrderService} from "../order.service";
import {UserService} from "../user.service";
import {TuiStringHandler} from "@taiga-ui/cdk";

@Component({
  selector: 'app-group-choice',
  templateUrl: './group-choice.component.html',
  styleUrls: ['./group-choice.component.css']
})
export class GroupChoiceComponent implements OnInit, OnDestroy {
  public title =  'Groupe';
  groups: Group[] = [];
  private subscription: Subscription | undefined;
  public loaded = false;
  private _groups$ = new BehaviorSubject<Group[]>([]);
  open = false;
  restoForm: FormControl = new FormControl(null, Validators.required);
  form = new FormGroup({
    resto: this.restoForm
  });
  restaurantsList: any[] = [];

  constructor(public socketService: SocketService, private orderService: OrderService, public userService: UserService) {}

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
  }

  getGroups(): Observable<Group[]> {
    return this._groups$;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected readonly OrderStatus = OrderStatus;

  stringify: TuiStringHandler<any> = restaurant => restaurant.name;

  showDialog(): void {
    this.open = true;
  }

  createGroup(observer: any): void {
    if (this.restoForm.valid) {
      this.socketService.createGroup(this.restoForm.value);
      observer.complete();
    }
  }

  libelleByRestaurantId(restaurantId: number): string {
    const resto = this.restaurantsList.find(r => r.id === restaurantId);
    return resto ? resto.libelle : '';
  }

  closeDialog(observer: any): void {
    observer.complete();
  }

}
