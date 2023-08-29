import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {HelloComponent} from "./hello/hello.component";
import {SushiListComponent} from "./sushi-list/sushi-list.component";

const routes: Routes = [
  { path: '**', component: SushiListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
