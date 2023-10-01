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
import {CreateGroupComponent} from "./create-group/create-group.component";

const routes: Routes = [
  { path: '', component: HelloComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
  { path: 'group', component: GroupChoiceComponent, canActivate: [AuthGuard] },
  { path: 'create-group', component: CreateGroupComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'recent', component: RecentComponent, canActivate: [AuthGuard] },
  { path: 'logout', component: HelloComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'order', component: SushiListComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
