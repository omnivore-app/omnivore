
describe('add link button', () => {
  before(() => {
    const email = 'tester@omnivore.app'
// const username = 'testuser'
const password = 'testpassword'

    cy.login(email, password)
    cy.visit('/home');
  });

  it('should add a link', () => {
    // Use keyboard command to open add link modal
    cy.get('body').type('a')

    cy.focused().type('https://jacksonh.org/{enter}')

    // wait for the link to be added
    cy.wait(2000)

    cy.reload()
    // cy.get('[data-testid="add-link-button"]').click();
    // cy.get('[data-testid="link-input"]').type('https://www.google.com');
    // cy.get('[data-testid="link-input"]').type('{enter}');
    // cy.get('[data-testid="link-input"]').should('have.value', '');
    // cy.get('[data-testid="link-input"]').type('https://www.google.com');
    // cy.get('[data-testid="link-input"]').type('{enter}');
    // cy.get('[data-testid="link-input"]').should('have.value', '');
  });
});
