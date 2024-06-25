import { AuthGuard } from './account/shared/auth.guard';
import { AuthenticationComponent } from './layout/authentication/authentication.component';
import { HomeComponent } from './layout/home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MosaicListComponent } from './mosaic-list/mosaic-list.component';
import { LoginComponent } from './account/login/login.component';
import { UploadComponent } from './account/upload/upload.component';
import { PieceRandomComponent } from './account/piece-random/piece-random.component';

const routes: Routes = [
  {
    path:'',
    component: HomeComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'mosaicos', component: MosaicListComponent }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: '',
    component: AuthenticationComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'upload/:id', component: UploadComponent },
      { path: 'piece-random/:id', component: PieceRandomComponent },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  // imports: [RouterModule.forRoot(routes)],

  exports: [RouterModule]
})
export class AppRoutingModule { }
