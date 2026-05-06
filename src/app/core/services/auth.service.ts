import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  authState,
  signOut,
  User as FirebaseUser
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Signal to hold the current user state
  readonly currentUser = signal<FirebaseUser | null>(null);
  readonly isLoading = signal<boolean>(true); // start true while checking auth state

  constructor() {
    authState(this.auth).subscribe(async (user) => {
      this.currentUser.set(user);
      if (user) {
        // Checking user document on connection
        await this.handleUserRoute(user);
      } else {
        this.isLoading.set(false);
      }
    });

    this.checkEmailLink();
  }

  private async handleUserRoute(user: FirebaseUser) {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData['hasCompletedOnboarding']) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/onboarding']);
        }
      } else {
        // Create user document using precise subset of allowed keys
        await setDoc(userRef, {
          email: user.email,
          hasCompletedOnboarding: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        this.router.navigate(['/onboarding']);
      }
    } catch (error) {
      console.error("Error setting user routing data:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async checkEmailLink() {
    if (isSignInWithEmailLink(this.auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // If missing email, prompt user for it
        email = window.prompt("Veuillez confirmer votre e-mail pour finaliser la connexion :");
      }
      if (email) {
        try {
          this.isLoading.set(true);
          await signInWithEmailLink(this.auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
        } catch (error) {
          console.error("Erreur de connexion par lien e-mail", error);
        } finally {
          this.isLoading.set(false);
        }
      }
    }
  }

  // Sends an email magic link
  async sendEmailLink(email: string): Promise<void> {
    this.isLoading.set(true);
    const actionCodeSettings = {
      // Use current origin and route to auth page
      url: window.location.origin + '/auth',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
    } catch (error) {
      console.error("Erreur lors de l'envoi du lien", error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Handle a Google OAuth login
  async loginWithGoogle(): Promise<void> {
    this.isLoading.set(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      // Navigation handled by authState
    } catch (error) {
      console.error("Erreur de connexion Google", error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }
}
