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
                <div role="alert">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message ?? "An unexpected error occurred."}</p>
                    <button onClick={this.handleReset}>Go home</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
