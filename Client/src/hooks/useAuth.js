import { useMe } from "../features/auth/auth.hooks";

export const useAuth = () => {
  const { data: user, isLoading } = useMe();

  return {
    user,
    isAuthenticated: !!user,
    isLoading
  };
};