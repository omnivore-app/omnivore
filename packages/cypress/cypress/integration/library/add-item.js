
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
  });
});
