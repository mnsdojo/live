import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'room/:roomId',
    loadComponent: () => import('./pages/room/room').then((m) => m.Room),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
