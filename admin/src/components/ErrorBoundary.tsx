import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State { return { hasError: true }; }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-h4 text-text-primary">Algo salió mal</h2>
          <p className="text-body-sm text-text-secondary">Estamos trabajando para solucionarlo.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
