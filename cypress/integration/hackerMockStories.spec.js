describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Mocking the API', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')

        cy.wait('@getStories')
      })
      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I assert on the data?
      // This is why this test is being skipped.
      // TODO: Find a way to test it out.
        it.skip('shows the right data for all rendered stories', () => {})

        it('shows one less stories after dimissing the first story', () => {
          cy.get('.button-small').first().click()

          cy.get('.item').should('have.length', 1)
        })
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context.skip('Order by', () => {
          it('orders by title', () => {})

          it('orders by author', () => {})

          it('orders by comments', () => {})

          it('orders by points', () => {})
        })
      })
    })

    context.only('Search', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'empty' }
        ).as('getEmptyStories')

        cy.intercept(
          'GET',
        `**/search?query=${newTerm}&page=0`,
        { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')

        cy.get('#search')
          .clear()
      })

      it('types and hits ENTER', () => {
        cy.get('#search').type(`${newTerm}{enter}`)

        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`).should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search').type(newTerm)
        cy.contains('Submit').click()

        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`).should('be.visible')
      })

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')

          cy.intercept(
            'GET',
            // pega todas as buscas feitas ** após o search
            '**/search**',
            { fixture: 'empty' }
          ).as('getRandomStories')

          Cypress._.times(6, () => {
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)
            cy.wait('@getRandomStories')
          })

          // cy.assertLoadingIsShownAndHidden()

          cy.get('.last-searches button').should('have.length', 5)
        })
      })
    })
  })
})
context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept('GET', '**/search**', { statusCode: 500 }).as('getServerFail')

    cy.visit('/')
    cy.wait('@getServerFail')

    cy.get('p:contains(Something went wrong)').should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept('GET', '**/search**', { forceNetworkError: true }).as(
      'getNetworkFailure'
    )

    cy.visit('/')
    cy.wait('@getNetworkFailure')
    cy.get('p:contains(Something went wrong)').should('be.visible')
  })
})
