import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../socket.service";
import {Group} from "../model/group.model";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {TuiDialogService} from "@taiga-ui/core";
import {OrderStatus} from "../model/order.model";

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

  constructor(public socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.getGroups();
    this.subscription = this.socketService.groupsUpdate.subscribe(groups => {
      this.groups = groups;
      this._groups$.next(this.groups);
    });
  }

  getGroups(): Observable<Group[]> {
    return this._groups$;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected readonly OrderStatus = OrderStatus;
}
