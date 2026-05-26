import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render errors in the page tree so a single broken component shows a
 * recoverable fallback instead of white-screening the whole app. The surrounding
 * layout chrome (sidebar, footer) stays mounted because this wraps only the routes.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Render error caught by ErrorBoundary:", error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-6xl uppercase tracking-tight text-accent-red">
          Something broke
        </p>
        <p className="font-body mt-4 max-w-md text-sm text-text-secondary">
          This page hit an unexpected error. Try again, or head back home.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={this.handleReset}
            className="rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover cursor-pointer"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-lg border border-border px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-text-primary transition-colors hover:bg-bg-elevated cursor-pointer"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}
