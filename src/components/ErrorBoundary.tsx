import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#fcfbfa',
          fontFamily: 'Urbanist, system-ui, sans-serif',
          color: '#1c1917',
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e0',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#dc2626', fontWeight: 'bold', fontSize: '1.25rem' }}>
                ⚠️
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Something went wrong</h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#78716c' }}>An unexpected error occurred while rendering the page.</p>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#1c1917',
              color: '#f5f5f4',
              padding: '1rem',
              borderRadius: '0.75rem',
              fontSize: '0.8125rem',
              fontFamily: 'monospace',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {this.state.error?.toString() || 'Unknown Error'}
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007a65',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
