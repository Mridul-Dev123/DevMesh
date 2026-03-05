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
        <div>
            <h2>Create your DevMesh account</h2>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Server-side error banner */}
                {registerMutation.isError && (
                    <p role="alert">
                        {registerMutation.error?.response?.data?.message ?? "Registration failed."}
                    </p>
                )}

                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        placeholder="cool_dev"
                        {...register("username", {
                            required: "Username is required",
                            minLength: { value: 3, message: "Minimum 3 characters" },
                            maxLength: { value: 30, message: "Maximum 30 characters" },
                        })}
                    />
                    {errors.username && <p role="alert">{errors.username.message}</p>}
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Enter a valid email address",
                            },
                        })}
                    />
                    {errors.email && <p role="alert">{errors.email.message}</p>}
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

                <button type="submit" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Creating account..." : "Register"}
                </button>
            </form>

            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default RegisterPage;