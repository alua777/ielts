import { Component } from 'react';
import ErrorState from './ErrorState';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="This page could not be displayed"
          message="A client-side error interrupted the page. Reload it to continue."
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
