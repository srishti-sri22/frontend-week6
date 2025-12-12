// lib/auth.ts

export interface AuthData {
  username: string;
  userId: string;  // Ensure this is always a string
}

export const setAuthData = (username: string, userId: string) => {
  const authData: AuthData = {
    username,
    userId,
  };
  
  console.log('Setting auth data:', authData);
  
  localStorage.setItem('auth', JSON.stringify(authData));
};

export const getAuthData = (): AuthData | null => {
  const data = localStorage.getItem('auth');
  if (!data) return null;
  try {
    const parsedJson = JSON.parse(data);
    return parsedJson;
    
  } catch {
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('auth');
};

export const isAuthenticated = (): boolean => {
  return getAuthData() !== null;
};

// Helper to get just the user ID as a guaranteed string
export const getUserId = (): string  => {
  const authData = getAuthData();
//   console.log(authData)
  if (!authData) return "null";
  
  // Double-check it's a string
  return authData.userId ;
};

// Helper to get username
export const getUsername = (): string | null => {
  const authData = getAuthData();
  return authData?.username || null;
};