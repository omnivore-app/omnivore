
describe('pages that require auth', () => {
  it('should add a link', () => {
    cy.visit('/home')
    cy.location('pathname')
      .should('be.equal', '/login')
  });
});
