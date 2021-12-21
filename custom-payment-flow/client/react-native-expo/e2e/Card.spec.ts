import {
  launchApp,
  dismissDevDialog,
  takeScreenshot,
  elementByText,
  elementByResourceId,
  clickOn,
  fillIn
} from './helpers';

describe('Payment with card', () => {
  before(async () => {
    await dismissDevDialog();
  });

  beforeEach(async () => {
    await launchApp();
  });

  afterEach(async function () {
    if (this.currentTest && !this.currentTest.isPassed) {
      await takeScreenshot(this.currentTest.fullTitle().replace(/\s+/g, '_'));
    }
  });

  it("Happy path", async () => {
    await clickOn(elementByText("Card"));
    await fillIn(elementByText("Name"), "Saul Goodman");
    await fillIn(elementByResourceId("card_number_edit_text"), "4242424242424242");

    await fillIn(elementByResourceId("expiry_date_edit_text"), "12/25");
    await fillIn(elementByResourceId("cvc_edit_text"), "123");

    await fillIn(elementByResourceId("postal_code_edit_text"), "1000");

    await clickOn(elementByText("PAY"));

    expect(await elementByText("The payment was confirmed successfully")).toBeDisplayed();
    await clickOn(elementByText("OK"));
  });

  it("Failure path", async () => {
    await clickOn(elementByText("Card"));
    await fillIn(elementByText("Name"), "Saul Goodman");
    await fillIn(elementByResourceId("card_number_edit_text"), "4000000000000101");

    await fillIn(elementByResourceId("expiry_date_edit_text"), "12/25");
    await fillIn(elementByResourceId("cvc_edit_text"), "123");

    await fillIn(elementByResourceId("postal_code_edit_text"), "1000");

    await clickOn(elementByText("PAY"));

    expect(await elementByText("Error code:")).toBeDisplayed();
    await clickOn(elementByText("OK"));
  });
});
