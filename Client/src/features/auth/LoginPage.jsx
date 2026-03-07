import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { useLogin } from "./auth.hooks";

const LoginPage = () => {
    const location = useLocation();
    // Where the user was trying to go before being redirected to /login
    const from = location.state?.from ?? "/feed";

    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        // Pass `from` as mutation context so the hook can redirect after success
        loginMutation.mutate(data, { context: { from } });
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 -top-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
                <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
            </div>

            <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-900/60 lg:grid-cols-2">
                <section className="hidden border-r border-slate-800 bg-slate-900/70 p-10 lg:block">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">DevMesh</p>
                    <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-100">
                        Share ideas,
                        <br />
                        ship together.
                    </h1>
                    <p className="mt-4 max-w-sm text-sm text-slate-400">
                        Join developers posting progress, snippets, and quick fixes every day.
                    </p>
                </section>

                <section className="p-6 sm:p-8 lg:p-10">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Welcome back</h2>
                    <p className="mt-1 text-sm text-slate-400">Login to continue to your feed.</p>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
                        {loginMutation.isError && (
                            <p
                                role="alert"
                                className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                            >
                                {loginMutation.error?.response?.data?.message ?? "Login failed."}
                            </p>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Username
                            </label>
                            <input
                                id="username"
                                placeholder="your_username"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-cyan-500"
                                {...register("username", {
                                    required: "Username is required",
                                    minLength: { value: 3, message: "Minimum 3 characters" },
                                })}
                            />
                            {errors.username && <p role="alert" className="text-xs text-red-300">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-cyan-500"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Minimum 6 characters" },
                                })}
                            />
                            {errors.password && <p role="alert" className="text-xs text-red-300">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loginMutation.isPending ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="mt-5 text-sm text-slate-400">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200">
                            Register
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default LoginPage;