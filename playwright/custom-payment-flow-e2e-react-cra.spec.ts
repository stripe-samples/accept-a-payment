import { test, expect } from '@playwright/test';
import { URL } from 'url';
const appUrl = new URL(process.env.DOMAIN);

test('Custom Payment Flow snapshots -- react-cra: Card', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Card"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: US bank account - ACH debits', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="US bank account - ACH debits"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Pre-authorized debit in Canada (ACSS)', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Pre-authorized debit in Canada (ACSS)"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: BECS Direct Debit', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="BECS Direct Debit"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: SEPA Direct Debit', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="SEPA Direct Debit"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Bancontact', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Bancontact"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: EPS', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="EPS"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: FPX', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="FPX"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: giropay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="giropay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: iDEAL', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="iDEAL"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Przelewy24 (P24)', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Przelewy24 (P24)"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Sofort', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Sofort"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: JP Bank transfer(銀行振込)', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="JP Bank transfer(銀行振込)"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Afterpay / Clearpay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Afterpay / Clearpay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Klarna', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Klarna"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Boleto', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Boleto"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: OXXO', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="OXXO"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Konbini', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Konbini"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Alipay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Alipay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Apple Pay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Apple Pay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: Google Pay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Google Pay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: GrabPay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="GrabPay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- react-cra: WeChat Pay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="WeChat Pay"]').click();
  await expect(page).toHaveScreenshot();
});
