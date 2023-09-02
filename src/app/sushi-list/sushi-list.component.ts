import {Component, OnInit} from '@angular/core';
import {InfosService} from "../infos.service";
import {Categorie} from "../model/categorie.model";
import {OrderItem} from "../model/order-item.model";
import {tuiIconMinus, tuiIconPlus} from "@taiga-ui/icons";
import {OrderService} from "../order.service";

@Component({
  selector: 'app-sushi-list',
  templateUrl: './sushi-list.component.html',
  styleUrls: ['./sushi-list.component.css']
})
export class SushiListComponent implements OnInit {
  public indexes: number[] = [];
  public sushiList: Categorie[] = [];
  protected readonly tuiIconPlus = tuiIconPlus;
  protected readonly tuiIconMinus = tuiIconMinus;

  constructor(public orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getMenuObservable().subscribe(data => {
      this.indexes = Array(data.length).fill(0);
      this.sushiList = data;
    });
  }
}
