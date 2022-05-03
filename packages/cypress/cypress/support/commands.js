
import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/email-login')

    cy.get('input[name=email]').type(email)
    cy.get('input[name=password]').type(password)

    cy.get('form').submit()

    cy.getCookie('auth').should('exist')
    cy.location('pathname').should('include', '/home')
  })
})

Cypress.Commands.add('registerEmail', (email, username, password, fullName) => {
  cy.visit('/email-registration')

  cy.get('input[name=email]').type(email)
  cy.get('input[name=username]').type(username)
  cy.get('input[name=password]').type(password)
  cy.get('input[name=name]').type(fullName)

  cy.get('form').submit()

  // we should be redirected to /dashboard
  cy.location('pathname').should('include', '/email-login')
})

Cypress.Commands.add('addItem', (link) => {
  cy.get('body').type('a')

  cy.focused().type(`${link}{enter}`)

  // wait for the link to be added
  cy.wait(2000)

  cy.reload()
})
