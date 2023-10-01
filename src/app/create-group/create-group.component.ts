import { Component } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent {
  groupName: string = '';

  constructor(private socketService: SocketService) {}

  createGroup(): void {
    if (this.groupName) {
      this.socketService.createGroup({ name: this.groupName });
    }
  }
}
