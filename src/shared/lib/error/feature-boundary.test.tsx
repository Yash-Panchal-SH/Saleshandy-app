import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FeatureBoundary } from './feature-boundary'

function Boom(): never {
  throw new Error('feature crashed')
}

describe('FeatureBoundary', () => {
  it('renders an isolated fallback when a child throws', () => {
    // Suppress React's expected error logging for this intentional crash.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <div>
        <span>sibling stays</span>
        <FeatureBoundary feature="demo">
          <Boom />
        </FeatureBoundary>
      </div>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This section failed to load.')
    expect(screen.getByText('sibling stays')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('renders a custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <FeatureBoundary feature="demo" fallback={<p>custom fallback</p>}>
        <Boom />
      </FeatureBoundary>,
    )
    expect(screen.getByText('custom fallback')).toBeInTheDocument()
    spy.mockRestore()
  })
})
