import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import {
  TuiRootModule,
  TuiDialogModule,
  TuiAlertModule,
  TuiButtonModule,
  TuiLoaderModule,
  TuiModeModule,
  TuiThemeNightModule,
  TuiGroupModule,
  TuiTextfieldControllerModule,
  TUI_SANITIZER,
  TuiLinkModule, TuiHintModule, TuiDataListModule, TuiSvgModule, TuiErrorModule
} from "@taiga-ui/core";
import {
  TuiAutoColorModule,
  TuiAvatarModule,
  TuiAvatarStackModule, TuiFadeModule,
  TuiFallbackSrcModule,
  TuiInitialsModule
} from '@taiga-ui/experimental';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HelloComponent } from './hello/hello.component';
import { SushiListComponent } from './sushi-list/sushi-list.component';
import {
    TuiAccordionModule,
    TuiBadgeModule,
    TuiCarouselModule,
    TuiDataListWrapperModule,
    TuiInputDateModule,
    TuiInputModule,
    TuiInputNumberModule,
    TuiInputPhoneModule,
    TuiIslandModule,
    TuiLineClampModule,
    TuiMarkerIconModule,
    TuiPaginationModule,
    TuiSelectModule
} from "@taiga-ui/kit";
import {HttpClientModule} from "@angular/common/http";
import {TuiMoneyModule} from "@taiga-ui/addon-commerce";
import {of} from "rxjs";
import {TUI_LANGUAGE, TUI_FRENCH_LANGUAGE} from "@taiga-ui/i18n";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TuiAppBarModule, TuiMobileCalendarDialogModule, TuiTabBarModule} from "@taiga-ui/addon-mobile";
import {AuthModule} from "@auth0/auth0-angular";
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RecentComponent } from './recent/recent.component';
import { CartComponent } from './cart/cart.component';
import {TuiBlockStatusModule} from "@taiga-ui/layout";
import { LoaderComponent } from './loader/loader.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { RegisterComponent } from './register/register.component';
import { GroupChoiceComponent } from './group-choice/group-choice.component';

@NgModule({
  declarations: [
    AppComponent,
    HelloComponent,
    SushiListComponent,
    LoginComponent,
    ProfileComponent,
    RecentComponent,
    CartComponent,
    LoaderComponent,
    RegisterComponent,
    GroupChoiceComponent,
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
    TuiLinkModule,
    TuiBlockStatusModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    TuiInputPhoneModule,
    TuiHintModule,
    TuiDataListModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiAppBarModule,
    TuiAvatarStackModule,
    TuiInitialsModule,
    TuiAutoColorModule,
    TuiFallbackSrcModule,
    TuiSvgModule,
    TuiFadeModule,
    TuiInputDateModule,
    TuiMobileCalendarDialogModule,
    TuiErrorModule,
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
