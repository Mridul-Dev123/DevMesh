import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../features/auth/auth.hooks";

const Navbar = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  return (
    <nav>
      <h1>DevMesh</h1>

      {user ? (
        <>
          <span>{user.username}</span>
          <button onClick={() => logoutMutation.mutate()}>
            Logout
          </button>
        </>
      ) : (
        <span>Not logged in</span>
      )}
    </nav>
  );
};

export default Navbar;