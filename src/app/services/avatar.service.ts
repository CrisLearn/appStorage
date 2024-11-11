import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadString } from '@angular/fire/storage';
import { Photo } from '@capacitor/camera';
import { switchMap } from 'rxjs/operators'; // Importa switchMap si lo necesitas para trabajar con observables

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(private auth: Auth, private firestore: Firestore, private storage: Storage) {}

  // Método para obtener el perfil del usuario
  getUserProfile() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    return docData(userDocRef, { idField: 'id' });
  }

  // Método para subir la imagen al Storage de Firebase
  async uploadImage(cameraFile: Photo): Promise<boolean | null> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!cameraFile.base64String) {
      console.error("Image data is missing");
      return null;
    }

    const path = `uploads/${user.uid}/profile.webp`; // Ruta donde se almacenará la imagen
    const storageRef = ref(this.storage, path); // Referencia al archivo en Firebase Storage

    try {
      // Subir la imagen usando base64
      await uploadString(storageRef, cameraFile.base64String, 'base64');

      // Obtener la URL de descarga de la imagen subida
      const imageUrl = await getDownloadURL(storageRef);

      // Referencia al documento del usuario en Firestore
      const userDocRef = doc(this.firestore, `users/${user.uid}`);

      // Actualizar la URL de la imagen en el documento del usuario
      await setDoc(userDocRef, { imageUrl }, { merge: true }); // Usamos `merge: true` para no sobrescribir otros campos

      console.log("Image uploaded and URL saved to Firestore");
      return true;

    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }
}
