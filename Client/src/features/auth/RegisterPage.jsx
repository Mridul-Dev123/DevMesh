import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRegister } from "./auth.hooks";

const RegisterPage = () => {
    const registerMutation = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        registerMutation.mutate(data);
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
                <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
            </div>

            <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-900/60 lg:grid-cols-2">
                <section className="hidden border-r border-slate-800 bg-slate-900/70 p-10 lg:block">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">DevMesh</p>
                    <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-100">
                        Build your profile,
                        <br />
                        join the mesh.
                    </h1>
                    <p className="mt-4 max-w-sm text-sm text-slate-400">
                        Create an account to publish posts, share snippets, and follow devs.
                    </p>
                </section>

                <section className="p-6 sm:p-8 lg:p-10">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Create account</h2>
                    <p className="mt-1 text-sm text-slate-400">Start your DevMesh journey.</p>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
                        {registerMutation.isError && (
                            <p
                                role="alert"
                                className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                            >
                                {registerMutation.error?.response?.data?.message ?? "Registration failed."}
                            </p>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Username
                            </label>
                            <input
                                id="username"
                                placeholder="cool_dev"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-cyan-500"
                                {...register("username", {
                                    required: "Username is required",
                                    minLength: { value: 3, message: "Minimum 3 characters" },
                                    maxLength: { value: 30, message: "Maximum 30 characters" },
                                })}
                            />
                            {errors.username && <p role="alert" className="text-xs text-red-300">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-cyan-500"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email address",
                                    },
                                })}
                            />
                            {errors.email && <p role="alert" className="text-xs text-red-300">{errors.email.message}</p>}
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
                            disabled={registerMutation.isPending}
                            className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {registerMutation.isPending ? "Creating account..." : "Register"}
                        </button>
                    </form>

                    <p className="mt-5 text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200">
                            Login
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default RegisterPage;