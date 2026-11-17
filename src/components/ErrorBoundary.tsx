import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Terjadi kesalahan pada aplikasi.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let friendlyMessage = 'Terjadi gangguan saat memuat data. Silakan muat ulang halaman.';
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed && parsed.error) {
          friendlyMessage = `Akses data terhenti: ${parsed.error}`;
        }
      } catch {
        if (this.state.message) {
          friendlyMessage = this.state.message;
        }
      }

      return (
        <div className="min-h-screen bg-[#08090C] text-[#F4F5F7] flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-[#111319] border border-white/10 rounded-xl p-6 space-y-4">
            <h1 className="text-xl font-semibold">Terjadi Kesalahan Sistem</h1>
            <p className="text-sm text-[#9BA1B0] leading-relaxed">{friendlyMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
