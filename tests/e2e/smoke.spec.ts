import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage hierarchy, proof and local demo',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Intelligence,governed.');
  await expect(page.getByRole('link',{name:/explore the kernel/i})).toHaveAttribute('href',/Shards-kernel/);
  await expect(page.getByRole('button',{name:/pip install shards-kernel/i})).toBeVisible();
  await page.getByRole('button',{name:'Begin simulation'}).click();
  await expect(page.getByText('Request submitted',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:/next state/i}).click();
  await expect(page.getByText('DENY / no permit')).toBeVisible();
  await page.screenshot({path:`test-results/home-${test.info().project.name}.png`,fullPage:true});
});
test('privacy, video consent and accessibility',async({page})=>{
  await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  const axe=await new AxeBuilder({page}).analyze();
  expect(axe.violations).toEqual([]);
  await page.getByRole('button',{name:/load external youtube video/i}).click();
  await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(1);
  await page.goto('/privacy');
  await expect(page.getByRole('heading',{name:'Privacy.'})).toBeVisible();
});
