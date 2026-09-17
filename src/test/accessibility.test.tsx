import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { expect, it } from 'vitest'
import App from '../App'

it('has no detectable accessibility violations in the default view', async () => {
  const { container } = render(<App />)
  expect((await axe(container)).violations).toHaveLength(0)
})
