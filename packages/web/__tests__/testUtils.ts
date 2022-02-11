/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

const Providers = ({ children }: any) => {
  return children
}

const customRender = (ui: any, options = {}) =>
  render(ui, { wrapper: Providers, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
