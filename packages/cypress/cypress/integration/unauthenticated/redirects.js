
describe('pages that require auth', () => {
  it('should redirect to login', () => {
    cy.visit('/home')
    cy.location('pathname')
      .should('be.equal', '/login')
  });
});
