import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TuiButtonModule, TuiLoaderModule, TuiModeModule, TuiThemeNightModule, TuiGroupModule, TuiTextfieldControllerModule, TUI_SANITIZER } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HelloComponent } from './hello/hello.component';
import { SushiListComponent } from './sushi-list/sushi-list.component';
import {
  TuiAccordionModule, TuiAvatarModule, TuiBadgeModule,
  TuiCarouselModule, TuiInputModule, TuiInputNumberModule,
  TuiIslandModule, TuiLineClampModule,
  TuiMarkerIconModule,
  TuiPaginationModule
} from "@taiga-ui/kit";
import {HttpClientModule} from "@angular/common/http";
import {TuiMoneyModule} from "@taiga-ui/addon-commerce";
import {of} from "rxjs";
import {TUI_LANGUAGE, TUI_FRENCH_LANGUAGE} from "@taiga-ui/i18n";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TuiTabBarModule} from "@taiga-ui/addon-mobile";
import {AuthModule} from "@auth0/auth0-angular";
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RecentComponent } from './recent/recent.component';
import { CartComponent } from './cart/cart.component';

@NgModule({
  declarations: [
    AppComponent,
    HelloComponent,
    SushiListComponent,
    LoginComponent,
    ProfileComponent,
    RecentComponent,
    CartComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule,
    AppRoutingModule,
    TuiIslandModule,
    TuiAccordionModule,
    HttpClientModule,
    TuiButtonModule,
    TuiCarouselModule,
    TuiMoneyModule,
    TuiLoaderModule,
    TuiMarkerIconModule,
    TuiPaginationModule,
    TuiBadgeModule,
    TuiThemeNightModule,
    TuiModeModule,
    TuiGroupModule,
    TuiInputNumberModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    FormsModule,
    TuiTabBarModule,
    AuthModule.forRoot({
      domain: 'dev-s3aabk78qzffvec5.eu.auth0.com',
      clientId: 'OQu1qUxKX45MA6OJ4kTV8jy4NnrKAZU8',
      authorizationParams: {
        redirect_uri: window.location.origin + '/authentication-callback',
      }
    }),
    BrowserAnimationsModule,
    TuiAvatarModule,
    TuiInputModule,
    TuiLineClampModule,
  ],
  providers: [
    {
      provide: TUI_LANGUAGE,
      useValue: of(TUI_FRENCH_LANGUAGE),
    },
      {provide: TUI_SANITIZER, useClass: NgDompurifySanitizer}
],
  bootstrap: [AppComponent]
})
export class AppModule { }
