import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/shared/components/ui/button'
import { handleChunkLoadError } from './chunk-reload'
import { reportError } from './report'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Top-of-tree boundary. Own implementation — no vendor SDK (SCAF-11). */
export class RootErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // A lazy-chunk failure → one-shot reload instead of showing the fallback.
    if (handleChunkLoadError(error)) return
    reportError(error, { boundary: 'root', componentStack: info.componentStack })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return <RootErrorFallback />
    }
    return this.props.children
  }
}

function RootErrorFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground text-sm">
        The app hit an unexpected error. Reloading usually fixes it.
      </p>
      <div className="flex gap-3">
        <Button type="button" onClick={() => window.location.reload()}>
          Reload
        </Button>
        {/* Placeholder — wired to the reporting tool when one is chosen (SCAF-11). */}
        <Button type="button" variant="outline" disabled>
          Report a problem
        </Button>
      </div>
    </main>
  )
}
