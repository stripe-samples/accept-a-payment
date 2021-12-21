export async function launchApp() {
  const pkg = 'host.exp.exponent';
  const activity = '.experience.HomeActivity';
  await browser.startActivity(pkg, activity);
  await browser.execute('mobile:deepLink', { url: 'exp://127.0.0.1:19000', package: pkg });
}

// FIXME: This is unnecessary if we can pass a boolean extra value EXKernelDisableNuxDefaultsKey to the app
export async function dismissDevDialog(retry = 5) {
  console.log(`Trying to dismiss dev dialog (retry = ${retry})`);
  try {
    await launchApp();

    const dialogCloseButton = await $(`android=new UiSelector().text("Got it")`);
    await dialogCloseButton.click();
    await $(`android=new UiSelector().text("react-native-expo")`);
    await browser.pause(1000);
  } catch (e) {
    if (retry > 0) {
      await dismissDevDialog(retry - 1);
    } else {
      console.log("Something went wrong while dismissing the dev dialog");
      await takeScreenshot('failedToDismissDevDialog');
      throw e;
    }
  }
}

export async function takeScreenshot(name: string) {
  require('fs').writeFileSync(
    `tmp/screenshots/${name}.png`,
    Buffer.from(await browser.takeScreenshot(), 'base64'),
    'binary'
  );
}

export async function elementByText(text: string) {
  return await $(`android=new UiSelector().text("${text}")`);
}

export async function elementByResourceId(id: string) {
  return await $(`//*[contains(@resource-id,"${id}")]`);
}

export async function clickOn(finder: Promise<WebdriverIO.Element>) {
  const el = await finder;
  await el.click();
}

export async function fillIn(finder: Promise<WebdriverIO.Element>, value: string) {
  const el = await finder;
  await el.setValue(value);
}
