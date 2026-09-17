import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

describe('dashboard behavior', () => {
  beforeEach(() => localStorage.clear())

  it('loads the four-country default and synchronizes controls and table', () => {
    render(<App />)
    expect(screen.getByText('4/4 selected')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Household' })).toBeChecked()
    const table = screen.getByRole('table')
    for (const country of ['United States', 'Germany', 'Brazil', 'Indonesia']) expect(within(table).getByText(country)).toBeInTheDocument()
  })

  it('enforces four countries and supports country replacement', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('checkbox', { name: 'China' })).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: 'Germany' }))
    await user.click(screen.getByRole('checkbox', { name: 'China' }))
    expect(within(screen.getByRole('table')).getByText('China')).toBeInTheDocument()
    expect(within(screen.getByRole('table')).queryByText('Germany')).not.toBeInTheDocument()
  })

  it('changes price audience and restores local preferences', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByRole('radio', { name: 'Business' }))
    expect(screen.getByRole('columnheader', { name: 'Business price' })).toBeInTheDocument()
    unmount()
    render(<App />)
    expect(screen.getByRole('radio', { name: 'Business' })).toBeChecked()
  })

  it('labels and persists the demo session without personal data', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Start demo session' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('not real authentication')
    await user.click(screen.getByRole('radio', { name: 'Sustainability lead' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Start demo session' }))
    expect(screen.getByRole('button', { name: /Sustainability lead/ })).toBeInTheDocument()
    expect(localStorage.getItem('energy-atlas-preferences-v1')).toContain('Sustainability lead')
  })

  it('downloads the visible comparison and exposes source links', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Download selected CSV' }))
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Mix data' })).toHaveAttribute('href', expect.stringContaining('owid'))
  })
})

