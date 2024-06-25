
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MosaicListComponent } from './mosaic-list/mosaic-list.component';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './account/login/login.component';
import { AuthenticationComponent } from './layout/authentication/authentication.component';
import { HomeComponent } from './layout/home/home.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { UploadComponent } from './account/upload/upload.component';
import { HttpClientModule } from '@angular/common/http'
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { ListTitlesComponent } from './shared/components/list-titles/list-titles.component';
import { TitleComponent } from './shared/components/title/title.component';
import { httpInterceptorProviders } from './shared/configurations/http-interceptors';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule} from '@angular/material/dialog';
import { ModalAddMosaicComponent } from './shared/components/modal-add-mosaic/modal-add-mosaic.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { PieceRandomComponent } from './account/piece-random/piece-random.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { MosaicRealTimeComponent } from './shared/components/mosaic-real-time/mosaic-real-time.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { CameraComponent } from './shared/components/camera/camera.component';
import { WebcamModule } from '@christianmenz/ngx-webcam';
import { CroppieModule } from 'angular-croppie-module';


@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    ListTitlesComponent,
    TitleComponent,
    DashboardComponent,
    MosaicListComponent,
    LoginComponent,
    AuthenticationComponent,
    HomeComponent,
    UploadComponent,
    ModalAddMosaicComponent,
    PieceRandomComponent,
    LoadingComponent,
    FooterComponent,
    MosaicRealTimeComponent,
    CameraComponent
  ],
  imports: [
    WebcamModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ImageCropperModule,
    NgxSliderModule,
    CroppieModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }), // ToastrModule added
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
