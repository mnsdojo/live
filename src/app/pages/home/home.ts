import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  roomId = '';
  protected readonly title = signal('liveit');
  constructor(private router: Router) {}
  generateRoomId() {
    this.roomId = crypto.randomUUID().split('-')[0];
  }
  createRoom() {}
  joinRoom() {
    if (!this.roomId.trim()) return;
    this.router.navigate(['/room', this.roomId]);
  }
}
