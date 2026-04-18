import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../features/auth/auth.hooks";
import { useUnreadCount } from "../features/chat/chat.hooks";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const { data: unreadCount = 0 } = useUnreadCount(Boolean(user));

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3 sm:px-5">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-100">DevMesh</h1>
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">Build in public</p>
        </div>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <Link
              to="/messages"
              className="relative rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-200 transition-colors hover:border-cyan-500 hover:text-cyan-200"
              aria-label="Open messages"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path d="M21 3L10 14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 3l-7 18-4-7-7-4 18-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-cyan-200"
            >
              @{user.username}
            </Link>
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
