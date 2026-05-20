import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from './report'

interface Props {
  feature: string
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Isolates a single feature's crash so the rest of the app keeps working.
 * Feature owners opt in — there is no mandatory per-route wrapping policy.
 */
export class FeatureBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, {
      boundary: 'feature',
      feature: this.props.feature,
      componentStack: info.componentStack,
    })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="text-muted-foreground rounded-md border border-dashed p-4 text-sm"
          >
            This section failed to load.
          </div>
        )
      )
    }
    return this.props.children
  }
}
