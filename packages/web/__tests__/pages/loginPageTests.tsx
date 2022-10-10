import { render } from '@testing-library/react'
import Login from '../../pages/login'

// Details on mocking a next router
// https://github.com/vercel/next.js/issues/7479
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    }
  },
}))

// This is the way => https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change

// TODO: find better way to wrap contexts (here and for storybook)
describe('the Login page', () => {
  it('renders itself', () => {
    const { queryByTestId } = render(<Login />, {})
    expect(queryByTestId('login-page-tag')).toBeInTheDocument()
  })
})
