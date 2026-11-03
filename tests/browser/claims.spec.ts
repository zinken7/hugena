import { test, expect } from '@playwright/test';
test('customer and reviewer workflows remain separate through publication',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/AI gives answers/})).toBeVisible();
 await page.screenshot({path:'artifacts/simple-home-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'Check a claim',exact:true}).click();
 await expect(page).toHaveURL(/\/review$/);
 await page.getByRole('button',{name:'Use the example'}).click();
 await page.getByRole('button',{name:'Compare advisers',exact:true}).click();
 await expect(page.getByRole('button',{name:'+ Add external adviser'})).toHaveCount(0);
 await expect(page.getByLabel('Demo case status')).toHaveCount(0);
 await page.getByRole('button',{name:'External advisers',exact:true}).click();
 await page.getByRole('button',{name:'Choose adviser',exact:true}).first().click();
 await page.getByRole('button',{name:'Submit request',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Your request is with your adviser.'})).toBeVisible();
 await expect(page.getByLabel('Key finding')).toHaveCount(0);
 await expect(page.getByLabel('Demo case status')).toHaveCount(0);
 await page.screenshot({path:'artifacts/customer-status.png',fullPage:true});
 await page.reload();
 await expect(page.getByRole('heading',{name:'Your request is with your adviser.'})).toBeVisible();
 await page.getByRole('link',{name:'Reviewer portal'}).click();
 await expect(page).toHaveURL(/\/reviewers$/);
 await page.getByRole('button',{name:'Review request',exact:true}).click();
 await page.getByLabel('Key finding').fill('The cost estimate omits request frequency.');
 await page.getByLabel('Evidence and sources').fill('No request or bandwidth model was supplied.');
 await page.getByLabel('Recommended next step').fill('Estimate usage before choosing a plan.');
 await page.reload();
 await page.getByRole('button',{name:'Review request',exact:true}).click();
 await expect(page.getByLabel('Key finding')).toHaveValue('The cost estimate omits request frequency.');
 await page.getByRole('button',{name:'Publish assessment'}).click();
 await expect(page.getByText('Published',{exact:true})).toBeVisible();
 await page.screenshot({path:'artifacts/reviewer-queue.png',fullPage:true});
 await page.getByRole('button',{name:'Edit assessment',exact:true}).click();
 await page.getByLabel('Demo case status').selectOption('paid');
 await expect(page.getByText('A$20.00',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Customer portal'}).click();
 await expect(page.getByRole('heading',{name:'Your review is ready.'})).toBeVisible();
 await page.getByRole('button',{name:'Read my report'}).click();
 await expect(page.getByText('The cost estimate omits request frequency.',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Publish assessment'})).toHaveCount(0);
 expect(errors).toEqual([]);
});
test('reviewer empty state and onboarding are separate from customer selection',async({page})=>{
 await page.goto('/reviewers');
 await expect(page.getByRole('heading',{name:'No assigned requests yet.'})).toBeVisible();
 await page.getByRole('button',{name:'Manage adviser profiles'}).click();
 await expect(page.getByRole('button',{name:'Choose adviser',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'+ Add external adviser'}).click();
 await page.getByLabel('Adviser name').fill('Jamie Test');
 await page.getByLabel('Expertise (separated by commas)').fill('Cloud costs');
 await page.getByLabel('About this adviser').fill('Technical adviser specialising in hosting costs.');
 await page.getByLabel('Sample opinion on the hosting-cost example').fill('I would check the request volume and storage assumptions first.');
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Add demo profile'}).click();
 await expect(page.getByRole('heading',{name:'Jamie Test',exact:true})).toBeVisible();
 await page.goto('/review');
 await page.getByRole('button',{name:'Use the example'}).click();
 await page.getByRole('button',{name:'Compare advisers',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Jamie Test',exact:true})).toBeVisible();
});
test('mobile homepage and both portals fit narrow screens',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const fits=async()=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/');await fits();
 await page.screenshot({path:'artifacts/simple-home-mobile.png',fullPage:true});
 await page.getByRole('link',{name:'Check a claim',exact:true}).click();
 await page.getByRole('button',{name:'Use the example'}).click();
 await page.getByRole('button',{name:'Compare advisers',exact:true}).click();await fits();
 await page.getByRole('button',{name:'Choose adviser',exact:true}).first().click();
 await page.getByRole('button',{name:'Submit request',exact:true}).click();await fits();
 await page.getByRole('link',{name:'Reviewer portal'}).click();await fits();
 await page.screenshot({path:'artifacts/reviewer-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Review request',exact:true}).click();await fits();
});

// An automated check complements the keyboard and visual review; it is not a full accessibility certification.
test('entry pages meet automated WCAG A/AA checks',async({page})=>{
 const {default:AxeBuilder}=await import('@axe-core/playwright');
 for(const path of ['/','/review','/reviewers']){
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
 }
});
