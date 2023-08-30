import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {HelloComponent} from "./hello/hello.component";
import {SushiListComponent} from "./sushi-list/sushi-list.component";
import {LoginComponent} from "./login/login.component";
import {AuthGuard} from "@auth0/auth0-angular";
import {ProfileComponent} from "./profile/profile.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HelloComponent },
  { path: 'logout', component: HelloComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'order', component: SushiListComponent, canActivate: [AuthGuard] },
  //{ path: '**', redirectTo: 'order' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
