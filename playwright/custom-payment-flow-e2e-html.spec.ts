import { test, expect } from '@playwright/test';
import { URL } from 'url';

const appUrl = new URL(process.env.DOMAIN);
const appHost = appUrl.hostname;

test('Custom Payment Flow snapshots -- html: Card', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Card"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: ACH Direct Debit', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="ACH Direct Debit"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: BECS Direct Debit', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="BECS Direct Debit"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: SEPA Direct Debit', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="SEPA Direct Debit"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Pre-authorized debit in Canada (ACSS)', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Pre-authorized debit in Canada (ACSS)"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Bancontact', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Bancontact"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: EPS', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="EPS"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: FPX', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="FPX"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: giropay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="giropay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: iDEAL', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="iDEAL"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Przelewy24 (P24)', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Przelewy24 (P24)"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Sofort', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Sofort"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Affirm', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Affirm"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Afterpay / Clearpay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Afterpay / Clearpay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Klarna', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Klarna"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Boleto', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Boleto"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: OXXO', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="OXXO"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Konbini', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Konbini"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Alipay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Alipay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Apple Pay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Apple Pay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: Google Pay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="Google Pay"]').click();
  await expect(page).toHaveScreenshot();
});

test('Custom Payment Flow snapshots -- html: GrabPay', async ({ page }) => {
  await page.goto(appUrl.href);
  await page.locator('role=link[name="GrabPay"]').click();
  await expect(page).toHaveScreenshot();
});

