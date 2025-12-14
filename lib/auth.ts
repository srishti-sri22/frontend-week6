import { useStore } from './store';

export const setAuthData = (username: string, userId: string, displayName?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('username', username);
    localStorage.setItem('user_id', userId);
    if (displayName) {
      localStorage.setItem('display_name', displayName);
    }
    useStore.getState().setUser(username, userId, displayName);
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('display_name');
    useStore.getState().clearUser();
  }
};

export const getUsername = (): string => {
  if (typeof window !== 'undefined') {
    const storeUsername = useStore.getState().username;
    if (storeUsername) return storeUsername;
    
    const localUsername = localStorage.getItem('username');
    if (localUsername) {
      const userId = localStorage.getItem('user_id');
      const displayName = localStorage.getItem('display_name');
      if (userId) {
        useStore.getState().setUser(localUsername, userId, displayName);
      }
      return localUsername;
    }
  }
  return 'undefined';
};

export const getDisplayName = (): string | null => {
  if (typeof window !== 'undefined') {
    const storeDisplayName = useStore.getState().displayName;
    if (storeDisplayName) return storeDisplayName;
    
    const localDisplayName = localStorage.getItem('display_name');
    if (localDisplayName) {
      const username = localStorage.getItem('username');
      const userId = localStorage.getItem('user_id');
      if (username && userId) {
        useStore.getState().setUser(username, userId, localDisplayName);
      }
      return localDisplayName;
    }
  }
  return null;
};

export const getUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    const storeUserId = useStore.getState().userId;
    if (storeUserId) return storeUserId;
    
    const localUserId = localStorage.getItem('user_id');
    if (localUserId) {
      const username = localStorage.getItem('username');
      const displayName = localStorage.getItem('display_name');
      if (username) {
        useStore.getState().setUser(username, localUserId, displayName);
      }
      return localUserId;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    const storeAuth = useStore.getState().isAuthenticated;
    if (storeAuth) return true;
    
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('user_id');
    const displayName = localStorage.getItem('display_name');
    const isAuth = !!(username && userId);
    
    if (isAuth) {
      useStore.getState().setUser(username!, userId!, displayName);
    }
    
    return isAuth;
  }
  return false;
};