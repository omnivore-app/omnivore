import { render } from '@testing-library/react'
import Login from '../../pages/login'
import { IntlProvider } from 'react-intl'
import { englishTranslations } from './../../locales/en/messages'

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
    const { queryByTestId } = render(
      <IntlProvider
        locale="en"
        defaultLocale="en"
        messages={englishTranslations}
      >
        <Login />
      </IntlProvider>,
      {}
    )
    expect(queryByTestId('login-page-tag')).toBeInTheDocument()
  })
})
