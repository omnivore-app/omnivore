
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