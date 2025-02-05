import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  getAuth,
  User,
} from '@angular/fire/auth';
import {
  map,
  switchMap,
  firstValueFrom,
  filter,
  Observable,
  Subscription,
} from 'rxjs';
import {
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  collectionData,
  Timestamp,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  FieldValue,
} from '@angular/fire/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Router } from '@angular/router';

type ChatMessage = {
  name: string | null;
  profilePicUrl: string | null;
  timestamp: FieldValue;
  uid: string | null;
  text?: string;
  imageUrl?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  storage: Storage = inject(Storage);
  messaging: Messaging = inject(Messaging);
  router: Router = inject(Router);
  private provider = new GoogleAuthProvider();
  LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

  // observable that is updated when the auth state changes
  user$ = user(this.auth);
  currentUser: User | null = this.auth.currentUser;
  userSubscription: Subscription;

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      this.currentUser = aUser;
    });
  }

  // Login Friendly Chat.
  async login() {
    const result = await signInWithPopup(this.auth, this.provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    this.router.navigate(['/', 'chat']);
    return credential;
  }

  // Logout of Friendly Chat.
  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/', 'login']);
      console.log('signed out');
    } catch (e) {
      console.error('sign out error', e);
    }
  }

  // Adds a text or image message to Cloud Firestore.
  addMessage = async (
    textMessage: string | null,
    imageUrl: string | null
  ): Promise<void | DocumentReference<DocumentData>> => {
    if (!textMessage && !imageUrl) {
      return;
    }

    if (this.currentUser === null) {
      return;
    }

    const message: ChatMessage = {
      name: this.currentUser.displayName,
      profilePicUrl: this.currentUser.photoURL,
      timestamp: serverTimestamp(),
      uid: this.currentUser?.uid,
    };

    if (textMessage) {
      message.text = textMessage;
    }

    if (imageUrl) {
      message.imageUrl = imageUrl;
    }

    try {
      const newMessageRef = await addDoc(
        collection(this.firestore, 'messages'),
        message
      );
      return newMessageRef;
    } catch (error) {
      console.error('Error writing message to Cloud Firestore', error);
    }
  };

  // Saves a new message to Cloud Firestore.
  saveTextMessage = async (messageText: string) => {
    return this.addMessage(messageText, null);
  };

  // Loads chat messages history and listens for upcoming ones.
  loadMessages = () => {
    const recentMessagesQuery = query(
      collection(this.firestore, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(12)
    );
    return collectionData(recentMessagesQuery);
  };

  // Saves a new message containing an image in Firebase.
  // This first saves the image in Firebase storage.
  saveImageMessage = async (file: any) => {};

  async updateData(path: string, data: any) {}

  async deleteData(path: string) {}

  getDocData(path: string) {}

  getCollectionData(path: string) {}

  async uploadToStorage(
    path: string,
    input: HTMLInputElement,
    contentType: any
  ) {
    return null;
  }
  // Requests permissions to show notifications.
  requestNotificationsPermissions = async () => {};

  saveMessagingDeviceToken = async () => {};
}
