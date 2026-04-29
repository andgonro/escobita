import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I open the application root URL', () => {
  cy.visit('/');
});

Then('I should see the lobby heading', () => {
  cy.contains('h1', 'La Escobini Kapitxorna').should('be.visible');
});

Then('the URL should remain on the lobby route', () => {
  cy.location('pathname').should('eq', '/');
});
