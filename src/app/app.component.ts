import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {Router} from "@angular/router";
import {OrderService} from "./order.service";
import {UserService} from "./user.service";
import {LoaderService} from "./loader.service";
import {Location} from "@angular/common";
import {TuiDialogService} from "@taiga-ui/core";
import {TUI_PROMPT, TuiPromptData} from "@taiga-ui/kit";
import {SocketService} from "./socket.service";
import {SwUpdate} from "@angular/service-worker";

interface Item {
    text: string;
    icon: string;
    badge?: number;
    link: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = null;

    items = [
        {
            text: 'Commande',
            icon: 'tuiIconFileTextLarge',
            badge: 0,
            link: '/order',
        },
        {
            text: 'Récent',
            icon: 'tuiIconClockLarge',
            badge: 0,
            link: '/recent',
        },
        {
            text: 'Panier',
            icon: 'tuiIconShoppingCartLarge',
            badge: 0,
            link: '/cart',
        }
    ];

    private dialog: any;

    constructor(private update: SwUpdate, public auth: AuthService, private orderService: OrderService, public userService: UserService, public router: Router, public loaderService: LoaderService, public location: Location, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService, private socketService: SocketService) {
        this.socketService.groupDeleted.subscribe(() => {
            this.orderService.exitGroup();
            this.router.navigate(['/']);
            this.dialogs
                .open(
                    'Le groupe a été dissous. Vous avez été déconnecté et redirigé vers la page d\'accueil.',
                    {label: 'Groupe dissous', size: 's'},
                )
                .subscribe();
        });
        this.socketService.groupKick.subscribe((email) => {
            if (email === this.userService.userEmail) {
                this.orderService.exitGroup();
                this.router.navigate(['/']);
                this.dialogs
                    .open(
                        'Vous avez été exclu(e) du groupe par l\'hôte.',
                        {label: 'Exclusion du groupe', size: 's'},
                    )
                    .subscribe();
            }
        });
        this.updateClient();
      if (this.update.isEnabled) setInterval(() => this.update.checkForUpdate().then(() => console.log('Checking for update')), 1000 * 60 * 5);
    }

    ngOnInit() {
        console.log(window.location.pathname);
    }

    public onRouterOutletActivate(event: any) {
        this.title = event.title ? event.title : null;
    }

    back() {
        if (this.router.url === '/group') this.router.navigate(['/']);
        else this.location.back();
    }

    exitGroup() {
        let message = 'Êtes-vous sûr de vouloir quitter le groupe ?';
        if (this.orderService.getGroup()) {
            message = this.orderService.getGroup()?.host.email === this.userService.userEmail ? 'Êtes-vous sûr de vouloir quitter le groupe ?\nVous êtes l\'hôte, le groupe sera dissous si vous quittez.' : 'Êtes-vous sûr de vouloir quitter le groupe ?';
        }
        const data: TuiPromptData = {
            content: message,
            yes: 'Oui',
            no: 'Non',
        };

        this.dialog = this.dialogs
            .open<boolean>(TUI_PROMPT, {
                label: 'Attention !',
                size: 's',
                data,
            }).subscribe((ans) => {
                if (ans) {
                    this.orderService.exitGroup();
                    this.router.navigate(['/']);
                }
            });
    }

    updateClient() {
      if (!this.update.isEnabled) {
        console.log('Not enabled');
        return;
      }
      this.update.versionUpdates.subscribe(event => {
        console.log('Event type', event.type);
        if (event.type === "VERSION_DETECTED") this.update.activateUpdate().then(() => document.location.reload());
      });
    }
}
