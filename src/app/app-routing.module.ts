import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {HelloComponent} from "./hello/hello.component";
import {SushiListComponent} from "./sushi-list/sushi-list.component";
import {LoginComponent} from "./login/login.component";
import {ProfileComponent} from "./profile/profile.component";
import {AuthGuard} from "./auth.guard";
import {CartComponent} from "./cart/cart.component";
import {RecentComponent} from "./recent/recent.component";
import {RegisterComponent} from "./register/register.component";
import {GroupChoiceComponent} from "./group-choice/group-choice.component";
import {DataResolver} from "./data.resolver";
import {GroupOrderPassedComponent} from "./group-order-passed/group-order-passed.component";
import {OrderHistoryComponent} from "./order-history/order-history.component";

const routes: Routes = [
  { path: '', component: HelloComponent, canActivate: [AuthGuard], resolve: {data: DataResolver} },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard], resolve: {data: DataResolver} },
  { path: 'group', component: GroupChoiceComponent, canActivate: [AuthGuard], resolve: {data: DataResolver} },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard], resolve: {data: DataResolver} },
  { path: 'recent', component: RecentComponent, canActivate: [AuthGuard], resolve: {data: DataResolver} },
  { path: 'logout', component: HelloComponent, canActivate: [AuthGuard], resolve: {data: DataResolver} },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], resolve: {data: DataResolver} },
  { path: 'order', component: SushiListComponent, canActivate: [AuthGuard], resolve: {data: DataResolver} },
  { path: 'orderPlaced', component: GroupOrderPassedComponent, canActivate: [AuthGuard], resolve: {data: DataResolver}},
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard], resolve: {data: DataResolver}},
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
