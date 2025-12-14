import { useStore } from './store';

export const setAuthData = (username: string, userId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('username', username);
    localStorage.setItem('user_id', userId);
    useStore.getState().setUser(username, userId);
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
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
      if (userId) {
        useStore.getState().setUser(localUsername, userId);
      }
      return localUsername;
    }
  }
  return 'undefined';
};

export const getUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    const storeUserId = useStore.getState().userId;
    if (storeUserId) return storeUserId;
    
    const localUserId = localStorage.getItem('user_id');
    if (localUserId) {
      const username = localStorage.getItem('username');
      if (username) {
        useStore.getState().setUser(username, localUserId);
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
    const isAuth = !!(username && userId);
    
    if (isAuth) {
      useStore.getState().setUser(username!, userId!);
    }
    
    return isAuth;
  }
  return false;
};