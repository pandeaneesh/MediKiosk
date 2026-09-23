import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[MediKiosk Crash Boundary]", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = window.location.origin + window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '24px',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          color: '#1e293b'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px'
            }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 10px', color: '#0f172a' }}>
              MediKiosk Interface Alert
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 20px' }}>
              A temporary interface exception was caught. The edge database and backend server remain fully operational.
            </p>
            <div style={{
              textAlign: 'left',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#dc2626',
              overflowX: 'auto',
              marginBottom: '24px'
            }}>
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  padding: '12px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                }}
              >
                🔄 Reload MediKiosk
              </button>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/?mode=patient'; }}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontWeight: '700',
                  fontSize: '14px',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                Direct Patient Mode
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
);

