import { test, expect } from '@playwright/test';
for (const width of [344,390,768,1024,1440,1920]) {
  test(`layout width ${width} has no horizontal overflow`,async({page})=>{
    await page.setViewportSize({width,height:844});
    await page.goto('/');
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
    const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client+1);
    if ([390,1440].includes(width)) await page.screenshot({path:`test-results/viewport-${width}-${test.info().project.name}.png`});
  });
}
