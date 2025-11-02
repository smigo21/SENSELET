export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}
