import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../features/auth/auth.hooks";

const Navbar = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3 sm:px-5">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-100">DevMesh</h1>
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">Build in public</p>
        </div>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
              @{user.username}
            </span>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Not logged in</span>
        )}
      </nav>
    </header>
  );
};

export default Navbar;