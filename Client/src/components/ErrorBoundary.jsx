import { Component } from "react";

/**
 * ErrorBoundary — catches unexpected render-time errors anywhere in its subtree.
 * Displays a friendly fallback instead of a white screen.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // You can log to an error reporting service here (e.g. Sentry)
        console.error("[ErrorBoundary]", error, info);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Navigate home after reset
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center px-4" role="alert">
                    <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-slate-950/90 p-6 shadow-xl shadow-slate-900/60">
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-300">Unexpected error</p>
                        <h2 className="mt-2 text-2xl font-extrabold text-slate-100">Something went wrong</h2>
                        <p className="mt-2 text-sm text-slate-300">
                            {this.state.error?.message ?? "An unexpected error occurred."}
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="mt-5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                        >
                            Go home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
