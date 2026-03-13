import { useMe } from "../features/auth/auth.hooks";

export const useAuth = () => {
  const { data: user, isPending } = useMe();

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isPending,
  };
};