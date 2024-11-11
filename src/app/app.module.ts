import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from "../environments/environment";
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth'; 
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Importa FormsModule y ReactiveFormsModule

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
	
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,  // Importa FormsModule para formularios de plantilla
    ReactiveFormsModule,  // Importa ReactiveFormsModule para formularios reactivos
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp({
      "projectId":"b-2bff7",
      "appId":"1:1045510192311:web:d5200b57294dbb7fe0e132",
      "storageBucket":"b-2bff7.firebasestorage.app",
      "apiKey":"AIzaSyAhoofBl1c9nmH5wa0dcQSIPPuwfumQtdI",
      "authDomain":"b-2bff7.firebaseapp.com",
      "messagingSenderId":"1045510192311",
      "measurementId":"G-M6LJ6CL8DY"
    })),
    provideFirestore(() => getFirestore()),
	provideAuth(() => getAuth())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
