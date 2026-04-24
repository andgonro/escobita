import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('the application is running', () => {
  // No-op: the dev server is expected to be running via baseUrl
});

When('I visit the home page', () => {
  cy.visit('/');
});

Then('I should see the application title', () => {
  cy.contains('escobita');
});
