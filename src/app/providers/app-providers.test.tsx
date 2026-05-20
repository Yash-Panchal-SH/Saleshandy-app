import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppProviders } from './app-providers'

describe('AppProviders', () => {
  it('boots the full provider chain and renders the home route', async () => {
    render(<AppProviders />)
    expect(await screen.findByRole('heading', { name: 'Saleshandy' })).toBeInTheDocument()
  })
})
