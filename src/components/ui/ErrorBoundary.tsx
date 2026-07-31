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
        <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal-red">
          Error
        </p>
        <p className="mt-2 font-mono text-5xl font-bold uppercase leading-none tracking-[-0.035em] text-text-primary">
          Something broke
        </p>
        <p className="mt-4 max-w-md text-sm text-text-secondary">
          This page hit an unexpected error. Try again, or head back home.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={this.handleReset}
            className="cursor-pointer border border-accent bg-accent px-5 py-[11px] font-mono text-[10px] uppercase tracking-[0.18em] text-bg-base transition-colors duration-100 hover:border-accent-hover hover:bg-accent-hover"
          >
            Try again
          </button>
          <a
            href="/"
            className="cursor-pointer border border-border-rule px-5 py-[11px] font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors duration-100 hover:border-accent hover:text-accent"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}
