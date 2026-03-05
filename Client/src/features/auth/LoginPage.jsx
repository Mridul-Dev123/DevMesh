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
        <div>
            <h2>Login to DevMesh</h2>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Server-side error banner */}
                {loginMutation.isError && (
                    <p role="alert">
                        {loginMutation.error?.response?.data?.message ?? "Login failed."}
                    </p>
                )}

                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        placeholder="your_username"
                        {...register("username", {
                            required: "Username is required",
                            minLength: { value: 3, message: "Minimum 3 characters" },
                        })}
                    />
                    {errors.username && <p role="alert">{errors.username.message}</p>}
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password", {
                            required: "Password is required",
                            minLength: { value: 6, message: "Minimum 6 characters" },
                        })}
                    />
                    {errors.password && <p role="alert">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
};

export default LoginPage;