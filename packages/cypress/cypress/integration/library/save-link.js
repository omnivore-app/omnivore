describe('save link', () => {
  const title = 'Omnivore - Cypress Webpage Test'
  const desc = 'OMNIvore'

  const TEST_LINK = 'https://blog.omnivore.app/p/getting-started-with-omnivore'

  const WEBPAGE_URL = 'https://sites.google.com/gitstart.dev/webpage/home'

  beforeEach(() => {
    const email = 'tester@omnivore.app'
    const password = 'testpassword'

    cy.login(email, password)
    cy.visit('/home')

    //if for whatever reason, there are no already existing links,
    //trying to get all links fails and throws an error
    //so by adding a dummy link first, we circumvent this error
    cy.addItem(TEST_LINK)

    //it takes quite a while for the added link to show up after adding.
    cy.wait(5000)

    //by adding a link above, the query below cannot fail
    // find and delete any already existing link.
    cy.findAllByTestId('linkedItemCard').each(() => {
      cy.get('body').type('j')
      cy.get('body').type('r')
    })
  })

  it('should save a web page', () => {
    //add the link
    cy.addItem(WEBPAGE_URL)

    //wait for the link to be on the page
    cy.wait(5000)

    //confirm that the title and description on the card is correct
    cy.findAllByTestId('linkedItemCard').first().within(() => {
      cy.findByTestId('listTitle').contains(title)
      cy.findByTestId('listDesc').contains(desc)
    })

    //confirm that the title and description on the article page is correct
    cy.findAllByTestId('linkedItemCard').first().click()
    cy.wait(5000)
    cy.findByTestId('article-headline').contains(title)
    cy.findByTestId('article-inner').contains(desc)
  })
})
