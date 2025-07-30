import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Firebase configuration - using environment variables or fallback values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "swiftsell-ai-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "swiftsell-ai-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "swiftsell-ai-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase with error handling
let app: any = null;
let auth: any = null;
let isFirebaseAvailable = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  isFirebaseAvailable = true;
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed, using mock authentication:', error);
  isFirebaseAvailable = false;
}

// User data interface
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  connectedPlatforms: {
    facebook?: boolean;
    facebookMarketplace?: boolean;
    spotify?: boolean;
    google?: boolean;
    ebay?: boolean;
    amazon?: boolean;
    shopify?: boolean;
    etsy?: boolean;
    mercari?: boolean;
    poshmark?: boolean;
    depop?: boolean;
    vinted?: boolean;
  };
  preferences: {
    defaultPlatform?: string;
    autoSync?: boolean;
    notifications?: boolean;
  };
}

// Authentication state management
let currentUser: UserProfile | null = null;
let authStateListeners: ((user: UserProfile | null) => void)[] = [];

// Initialize auth state listener
if (isFirebaseAvailable && auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = await createUserProfile(user);
      await saveUserToStorage(currentUser);
    } else {
      currentUser = null;
      await clearUserFromStorage();
    }
    
    // Notify all listeners
    authStateListeners.forEach(listener => listener(currentUser));
  });
} else {
  // Mock auth state for testing
  console.log('Using mock authentication system');
}

// Create user profile from Firebase user
async function createUserProfile(user: User): Promise<UserProfile> {
  const storedProfile = await getUserFromStorage();
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider: user.providerData[0]?.providerId || 'unknown',
    connectedPlatforms: storedProfile?.connectedPlatforms || {
      google: user.providerData.some(p => p.providerId === 'google.com')
    },
    preferences: storedProfile?.preferences || {
      defaultPlatform: 'ebay',
      autoSync: true,
      notifications: true
    }
  };
}

// Google Sign In
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    if (isFirebaseAvailable && auth) {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      return await createUserProfile(result.user);
    } else {
      // Mock Google authentication for testing
      const mockUser: UserProfile = {
        uid: 'mock-google-user-' + Date.now(),
        email: 'test@gmail.com',
        displayName: 'Test User',
        photoURL: 'https://via.placeholder.com/40',
        provider: 'google.com',
        connectedPlatforms: {
          google: true
        },
        preferences: {
          defaultPlatform: 'ebay',
          autoSync: true,
          notifications: true
        }
      };
      
      currentUser = mockUser;
      await saveUserToStorage(currentUser);
      
      // Notify all listeners
      authStateListeners.forEach(listener => listener(currentUser));
      
      console.log('Mock Google sign-in successful');
      return mockUser;
    }
  } catch (error) {
    console.error('Google sign in error:', error);
    throw new Error('Failed to sign in with Google');
  }
}

// Facebook Sign In
export async function signInWithFacebook(): Promise<UserProfile> {
  try {
    if (isFirebaseAvailable && auth) {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const profile = await createUserProfile(result.user);
      
      // Mark Facebook as connected
      profile.connectedPlatforms.facebook = true;
      await saveUserToStorage(profile);
      
      return profile;
    } else {
      // Mock Facebook authentication for testing
      const mockUser: UserProfile = {
        uid: 'mock-facebook-user-' + Date.now(),
        email: 'test@facebook.com',
        displayName: 'Facebook Test User',
        photoURL: 'https://via.placeholder.com/40',
        provider: 'facebook.com',
        connectedPlatforms: {
          facebook: true
        },
        preferences: {
          defaultPlatform: 'ebay',
          autoSync: true,
          notifications: true
        }
      };
      
      currentUser = mockUser;
      await saveUserToStorage(currentUser);
      
      // Notify all listeners
      authStateListeners.forEach(listener => listener(currentUser));
      
      console.log('Mock Facebook sign-in successful');
      return mockUser;
    }
  } catch (error) {
    console.error('Facebook sign in error:', error);
    throw new Error('Failed to sign in with Facebook');
  }
}

// Spotify OAuth (using Browser plugin for OAuth flow)
export async function connectSpotify(): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to connect Spotify');
  }
  
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID || 'your-spotify-client-id';
    const redirectUri = 'com.swiftsell.app://spotify-callback';
    const scopes = 'user-read-private user-read-email';
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}`;
    
    await Browser.open({ url: authUrl });
    
    // Note: In a real implementation, you'd handle the callback and exchange the code for tokens
    // For now, we'll just mark Spotify as connected
    currentUser.connectedPlatforms.spotify = true;
    await saveUserToStorage(currentUser);
    
  } catch (error) {
    console.error('Spotify connection error:', error);
    throw new Error('Failed to connect Spotify');
  }
}

// Connect Facebook Marketplace
export async function connectFacebookMarketplace(): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to connect Facebook Marketplace');
  }
  
  try {
    // Facebook Marketplace uses Facebook's API
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent('https://your-app.com/callback')}&scope=marketplace_management,pages_manage_posts&response_type=code`;
    
    await Browser.open({ url: authUrl });
    
    currentUser.connectedPlatforms.facebookMarketplace = true;
    await saveUserToStorage(currentUser);
    
  } catch (error) {
    console.error('Facebook Marketplace connection error:', error);
    throw new Error('Failed to connect Facebook Marketplace');
  }
}

// Connect Shopify
export async function connectShopify(): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to connect Shopify');
  }
  
  try {
    const authUrl = `https://{shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_products,write_products,read_orders&redirect_uri=${encodeURIComponent('https://your-app.com/callback')}&response_type=code`;
    
    await Browser.open({ url: authUrl });
    
    currentUser.connectedPlatforms.shopify = true;
    await saveUserToStorage(currentUser);
    
  } catch (error) {
    console.error('Shopify connection error:', error);
    throw new Error('Failed to connect Shopify');
  }
}

// Connect eBay
export async function connectEbay(): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to connect eBay');
  }
  
  try {
    const authUrl = `https://auth.ebay.com/oauth2/authorize?client_id=${process.env.EBAY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent('https://your-app.com/callback')}&scope=https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.account.readonly`;
    
    await Browser.open({ url: authUrl });
    
    currentUser.connectedPlatforms.ebay = true;
    await saveUserToStorage(currentUser);
    
  } catch (error) {
    console.error('eBay connection error:', error);
    throw new Error('Failed to connect eBay');
  }
}

// Connect Amazon
export async function connectAmazon(): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to connect Amazon');
  }
  
  try {
    const authUrl = `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${process.env.AMAZON_CLIENT_ID}&redirect_uri=${encodeURIComponent('https://your-app.com/callback')}&state=state123`;
    
    await Browser.open({ url: authUrl });
    
    currentUser.connectedPlatforms.amazon = true;
    await saveUserToStorage(currentUser);
    
  } catch (error) {
    console.error('Amazon connection error:', error);
    throw new Error('Failed to connect Amazon');
  }
}

// Connect Etsy
export async function connectEtsy(): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to connect Etsy');
  }
  
  try {
    const authUrl = `https://www.etsy.com/oauth/connect?response_type=code&redirect_uri=${encodeURIComponent('https://your-app.com/callback')}&scope=listings_r listings_w&client_id=${process.env.ETSY_CLIENT_ID}`;
    
    await Browser.open({ url: authUrl });
    
    currentUser.connectedPlatforms.etsy = true;
    await saveUserToStorage(currentUser);
    
  } catch (error) {
    console.error('Etsy connection error:', error);
    throw new Error('Failed to connect Etsy');
  }
}

// Connect other platforms (simplified for demo)
export async function connectPlatformGeneric(platform: keyof UserProfile['connectedPlatforms']): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to connect platforms');
  }
  
  try {
    // For platforms like Mercari, Poshmark, Depop, Vinted - these would need specific implementations
    // For now, we'll simulate the connection
    currentUser.connectedPlatforms[platform] = true;
    await saveUserToStorage(currentUser);
    
  } catch (error) {
    console.error(`${platform} connection error:`, error);
    throw new Error(`Failed to connect ${platform}`);
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    if (isFirebaseAvailable && auth) {
      await signOut(auth);
    } else {
      // Mock sign out
      currentUser = null;
      // Notify all listeners
      authStateListeners.forEach(listener => listener(null));
      console.log('Mock sign-out successful');
    }
    await clearUserFromStorage();
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
}

// Get current user
export function getCurrentUser(): UserProfile | null {
  return currentUser;
}

// Add auth state listener
export function onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
  authStateListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = authStateListeners.indexOf(callback);
    if (index > -1) {
      authStateListeners.splice(index, 1);
    }
  };
}

// Update user preferences
export async function updateUserPreferences(preferences: Partial<UserProfile['preferences']>): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to update preferences');
  }
  
  currentUser.preferences = { ...currentUser.preferences, ...preferences };
  await saveUserToStorage(currentUser);
}

// Connect platform
export async function connectPlatform(platform: keyof UserProfile['connectedPlatforms']): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to connect platforms');
  }
  
  currentUser.connectedPlatforms[platform] = true;
  await saveUserToStorage(currentUser);
}

// Disconnect platform
export async function disconnectPlatform(platform: keyof UserProfile['connectedPlatforms']): Promise<void> {
  if (!currentUser) {
    throw new Error('User must be logged in to disconnect platforms');
  }
  
  currentUser.connectedPlatforms[platform] = false;
  await saveUserToStorage(currentUser);
}

// Storage helpers
async function saveUserToStorage(user: UserProfile): Promise<void> {
  try {
    await Preferences.set({
      key: 'user_profile',
      value: JSON.stringify(user)
    });
  } catch (error) {
    console.error('Failed to save user to storage:', error);
  }
}

async function getUserFromStorage(): Promise<UserProfile | null> {
  try {
    const { value } = await Preferences.get({ key: 'user_profile' });
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Failed to get user from storage:', error);
    return null;
  }
}

async function clearUserFromStorage(): Promise<void> {
  try {
    await Preferences.remove({ key: 'user_profile' });
  } catch (error) {
    console.error('Failed to clear user from storage:', error);
  }
}

// Initialize user from storage on app start
export async function initializeAuth(): Promise<void> {
  try {
    const storedUser = await getUserFromStorage();
    if (storedUser && !currentUser) {
      // Verify the stored user is still valid by checking Firebase auth state
      // This will trigger the onAuthStateChanged listener
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error);
  }
}