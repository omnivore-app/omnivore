const email = 'tester@omnivore.app'
const username = 'testuser'
const password = 'testpassword'
const fullName = 'Test User'

describe('Register with email', () => {
  it('creates a new user', function () {
    cy.visit('/email-signup')

    cy.get('input[name=email]').type(email)
    cy.get('input[name=username]').type(username)
    cy.get('input[name=password]').type(password)
    cy.get('input[name=name]').type(fullName)

    cy.get('form').submit()

    // we should be redirected to /dashboard
    cy.location('pathname').should('include', '/email-login')
  })
})

describe('Login with email', () => {
  it('sets auth token and redirects', function () {
    cy.visit('/email-login')

    cy.get('input[name=email]').type(email)
    cy.get('input[name=password]').type(password)

    cy.get('form').submit()

    cy.getCookie('auth').should('exist')
    cy.location('pathname').should('include', '/home')
  })
})
