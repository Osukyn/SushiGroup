import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../user.service";
import {TuiStringHandler} from "@taiga-ui/cdk";
import {Restaurant} from "../register/register.component";
import {OrderService} from "../order.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnDestroy, OnInit {
  title = 'Sushi Group';
  today: number = new Date().getDay();
  isWednesday: boolean = this.today === 3;
  restoForm: FormControl = new FormControl(null, Validators.required);

  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | undefined;

  private intervalId: any;

  constructor(public authService: AuthService, private fb: FormBuilder, public userService: UserService, private orderService: OrderService, private router: Router) {
    this.updateCountdown();
    this.orderService.getRestaurantAddress() ? this.restoForm.setValue(this.orderService.getRestaurantAddress()) : this.restoForm.setValue('');
  }

  ngOnInit(): void {
    // Mettre à jour le compte à rebours toutes les secondes
    this.intervalId = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateCountdown(): void {
    const now = new Date();
    let nextOrderDate = new Date(now);

    // Si aujourd'hui est mercredi
    if (now.getDay() === 3) {
      if (now.getHours() < 10) {
        nextOrderDate.setHours(10, 0, 0, 0);
      } else {
        // Si c'est après 10h, le compteur reste à zéro pour le reste de la journée
        this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return;
      }
    } else if (now.getDay() > 3 || (now.getDay() === 3 && now.getHours() >= 10)) {
      // Calculer combien de jours jusqu'au mercredi suivant
      let daysUntilNextWednesday = 10 - now.getDay();
      nextOrderDate.setDate(now.getDate() + daysUntilNextWednesday);
      nextOrderDate.setHours(10, 0, 0, 0); // Réglage à 10h00
    } else if (now.getDay() < 3) {
      nextOrderDate.setDate(now.getDate() + (3 - now.getDay()));
      nextOrderDate.setHours(10, 0, 0, 0); // Réglage à 10h00
    }

    const diff = nextOrderDate.getTime() - now.getTime();

    this.countdown = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }

  stringify: TuiStringHandler<any> = restaurant => restaurant.name;

  onClick(): void {
    console.log(this.restoForm.value);
    if (this.restoForm.valid) {
      this.orderService.setRestaurantAddress(this.restoForm.value);
      this.router.navigate(['/order']);
    }
  }
}
