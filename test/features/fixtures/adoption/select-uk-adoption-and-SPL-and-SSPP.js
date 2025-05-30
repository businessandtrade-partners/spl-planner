// const { test: base } = require('@playwright/test')
const SelectAdoption = require('./select-adoption')

const test = SelectAdoption.extend({
  setupUKAdoptionPage: async ({ setupAdoptionPage: page }, use) => {
    await page.check("input[value='uk']", { force: true })
    await page.click('button:text("Continue")')
    await page
      .getByRole('group', {
        name: 'Is the primary adopter eligible for Shared Parental Leave?'
      })
      .getByLabel('Yes')
      .click({ force: true })
    await page
      .getByRole('group', {
        name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?'
      })
      .getByLabel('Yes')
      .click({ force: true })
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
