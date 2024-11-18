import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, query, orderBy, onSnapshot, getDocs, collectionData } from '@angular/fire/firestore';
import { addDoc, DocumentData, FirestoreDataConverter, serverTimestamp } from 'firebase/firestore';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  uid: string;
  email: string;
}

export interface Message {
  createdAt: any;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  currentUser: User | null = null;

  constructor(private afAuth: Auth, private afs: Firestore) {
    authState(this.afAuth).subscribe((user) => {
      if (user) {
        this.currentUser = { uid: user.uid, email: user.email ?? '' };
      } else {
        this.currentUser = null;
      }
    });
  }

  async signup({ email, password }: { email: string; password: string }): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.afAuth, email, password);
    const uid = credential.user.uid;
    await setDoc(doc(this.afs, `users/${uid}`), {
      uid,
      email: credential.user.email,
    });
  }

  async signIn({ email, password }: { email: string; password: string }): Promise<void> {
    await signInWithEmailAndPassword(this.afAuth, email, password);
  }

  async signOut(): Promise<void> {
    await signOut(this.afAuth);
  }

  addChatMessage(msg: string) {
    if (!this.currentUser) {
      throw new Error('No user is currently signed in.');
    }
  
    return addDoc(collection(this.afs, 'messages'), {
      msg,
      from: this.currentUser.uid,
      createdAt: serverTimestamp(),
    });
  }
  

  getChatMessages(): Observable<Message[]> {
    let users: User[] = [];
    return this.getUsers().pipe(
      switchMap((res: User[]) => {
        users = res;
        const messagesRef = collection(this.afs, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));
        return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
      }),
      map((messages: Message[]) => {
        return messages.map((m) => ({
          ...m,
          fromName: this.getUserForMsg(m.from, users),
          myMsg: this.currentUser?.uid === m.from,
        }));
      })
    );
  }

  private getUsers(): Observable<User[]> {
    const usersRef = collection(this.afs, 'users');
    return collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>;
  }

  private getUserForMsg(msgFromId: string, users: User[]): string {
    const user = users.find((usr) => usr.uid === msgFromId);
    return user ? user.email : 'Deleted';
  }
}
