import {Component, OnInit} from '@angular/core';
import {InfosService} from "../infos.service";
import {Categorie} from "../model/categorie.model";
import {Order} from "../model/order.model";
import {tuiIconMinus, tuiIconPlus} from "@taiga-ui/icons";

@Component({
  selector: 'app-sushi-list',
  templateUrl: './sushi-list.component.html',
  styleUrls: ['./sushi-list.component.css']
})
export class SushiListComponent implements OnInit {
  indexes: number[] = [];
  sushiList: Categorie[] | undefined;
  order: Order[] = [];
  constructor(private infosService: InfosService) {
    this.infosService.getMenu().subscribe((data) => {
      this.indexes = Array(data.length).fill(0);
      this.sushiList = data;
    });
  }

  ngOnInit() {

  }

  add(code: string) {
    let index = this.order.findIndex((order) => order.code === code);
    if (index === -1) {
      this.order.push(new Order(code, 1));
    } else {
      this.order[index].qte++;
    }
  }

  remove(code: string) {
    let index = this.order.findIndex((order) => order.code === code);
    if (index !== -1) {
      this.order[index].qte--;
      if (this.order[index].qte === 0) {
        this.order.splice(index, 1);
      }
    }
  }

  getQte(code: string) {
    let index = this.order.findIndex((order) => order.code === code);
    if (index !== -1) {
      return this.order[index].qte;
    } else {
      return 0;
    }
  }

  protected readonly tuiIconPlus = tuiIconPlus;
  protected readonly tuiIconMinus = tuiIconMinus;
}
