import { expect, test, type Page } from '@playwright/test';

async function openHome(page: Page, language = 'de') {
  await page.goto(`/?lang=${language}`, { waitUntil: 'networkidle' });
  await page.locator('html[data-i18n-ready="true"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`opening and navigation stay readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page);
    expect((await page.locator('.opening-stage').boundingBox())!.height).toBeGreaterThanOrEqual(900);
    await expect(page.locator('.opening-threads')).toBeVisible();
    for (const link of await page.locator('.site-header nav a:visible').all()) {
      await link.hover();
      const label = link.locator('.nav-label-primary');
      await expect(label).toHaveCSS('transform', 'none');
      const metrics = await label.evaluate(e => {
        const s = getComputedStyle(e);
        const b = e.getBoundingClientRect();
        const a = e.closest('a')!.getBoundingClientRect();
        return { line: parseFloat(s.lineHeight), font: parseFloat(s.fontSize), inside: b.top >= a.top && b.bottom <= a.bottom };
      });
      expect(metrics.line).toBeGreaterThanOrEqual(metrics.font * 1.4);
      expect(metrics.inside).toBe(true);
      await link.focus();
      await expect(link).toBeFocused();
    }
    if (width <= 768) {
      const status = await page.locator('.status-island').boundingBox();
      const nav = await page.locator('.site-header nav').boundingBox();
      expect(status!.height).toBe(nav!.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('education symbols and degree metadata have neutral surfaces', async ({ page }) => {
  await openHome(page);
  await page.locator('#ausbildung').scrollIntoViewIfNeeded();
  const symbol = page.locator('#ausbildung .group-icon');
  const box = await symbol.boundingBox();
  expect(box!.width).toBe(box!.height);
  await expect(symbol).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const degree = page.locator('#ausbildung .journey-context');
  await expect(degree).toContainText('Bachelor of Arts');
  await expect(degree).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(degree).toHaveCSS('color', 'rgb(89, 86, 84)');
});

test('tea and training share the desktop row while the mobile pot retains its space', async ({ page }) => {
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await openHome(page);
    await page.locator('.tea-ritual').scrollIntoViewIfNeeded();
    await expect(page.locator('.tea-ritual')).toHaveCSS('opacity', '1');
    // Reveal transforms must settle before measuring the actual grid.
    await expect.poll(async () => {
      const tea = (await page.locator('.tea-ritual').boundingBox())!;
      const training = (await page.locator('.training-card').boundingBox())!;
      return Math.abs(tea.y - training.y);
    }).toBeLessThan(2);
    const tea = (await page.locator('.tea-ritual').boundingBox())!;
    const training = (await page.locator('.training-card').boundingBox())!;
    expect(Math.abs(tea.y - training.y)).toBeLessThan(2);
    expect(tea.x + tea.width).toBeLessThan(training.x);
    expect(tea.width).toBeGreaterThan(training.width);
  }
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page);
    await page.locator('.tea-ritual').scrollIntoViewIfNeeded();
    const pot = (await page.locator('.teapot').boundingBox())!;
    const intro = (await page.locator('.tea-intro').boundingBox())!;
    const profile = (await page.locator('.tea-profile-heading').boundingBox())!;
    expect(pot.width).toBeGreaterThanOrEqual(220);
    expect(pot.y).toBeGreaterThan(intro.y + intro.height);
    expect(pot.y + pot.height).toBeLessThanOrEqual(profile.y);
    await expect.poll(() => page.locator('.tea-ritual .content-choice').evaluate(e => {
      const rows = Array.from(e.querySelectorAll('button'), button => button.getBoundingClientRect().y);
      return Math.max(...rows) - Math.min(...rows);
    })).toBeLessThan(1);
  }
});

test('every detail card visibly turns and settles with sharp, untransformed text', async ({ page }) => {
  await openHome(page);
  for (const card of await page.locator('.journey-card.has-flip, [data-thesis-card]').all()) {
    const thesis = await card.getAttribute('data-thesis-card') !== null;
    const open = card.locator(thesis ? '[data-thesis-open]' : '[data-flip-open]');
    const close = card.locator(thesis ? '[data-thesis-close]' : '[data-flip-close]');
    const front = card.locator(thesis ? '[data-thesis-front]' : '[data-flip-front]');
    const back = card.locator(thesis ? '[data-thesis-back]' : '[data-flip-back]');
    await open.click();
    // Inspect the actual turning face halfway through its outgoing motion.
    let turn: { transform: string; width: number; restingWidth: number } | null = null;
    await expect.poll(async () => {
      turn = await card.evaluate(e => {
        for (const face of e.querySelectorAll<HTMLElement>('.journey-card-face, .thesis-card-face')) {
          const animation = face.getAnimations().find(a => (a.effect as KeyframeEffect).getKeyframes().some(frame => frame.transform));
          if (!animation) continue;
          animation.pause(); animation.currentTime = 90;
          const result = { transform: getComputedStyle(face).transform, width: face.getBoundingClientRect().width, restingWidth: face.offsetWidth };
          animation.play(); return result;
        }
        return null;
      });
      return turn !== null;
    }).toBe(true);
    expect(turn!.transform).toContain('matrix3d');
    expect(turn!.width).toBeLessThan(turn!.restingWidth * 0.95);
    await expect(back).toHaveAttribute('aria-hidden', 'false');
    await expect(card).not.toHaveClass(/is-flipping/);
    await expect(back).toHaveCSS('transform', 'none');
    await expect(close).toBeFocused();
    await close.click();
    await expect(card).not.toHaveClass(/is-flipping/);
    await expect(front).toHaveAttribute('aria-hidden', 'false');
    await expect(front).toHaveCSS('transform', 'none');
    await expect(open).toBeFocused();
  }
});

test('rapid reversal and reduced motion leave the correct face accessible', async ({ page }) => {
  await openHome(page);
  const card = page.locator('.journey-card.has-flip').first();
  await card.locator('[data-flip-open]').click();
  await card.locator('h4').first().click({ force: true });
  await expect(card).not.toHaveClass(/is-flipped/);
  await expect(card.locator('[data-flip-front]')).toHaveAttribute('aria-hidden', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await card.locator('[data-flip-open]').click();
  await expect(card.locator('[data-flip-back]')).toHaveAttribute('aria-hidden', 'false');
  await expect(card).not.toHaveClass(/is-flipping/);
  await expect(card.locator('[data-flip-back]')).toHaveCSS('transform', 'none');
});

test('the pickup stays light and SEO stays German with the English interface', async ({ page }) => {
  await openHome(page, 'en');
  await expect(page).toHaveTitle('Fabian Deragisch | Marketing, E-Commerce & Teeliebhaber');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^Portfolio von Fabian Deragisch:/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.mouse.move(0, 0);
  const pickup = page.locator('.turntable-arm > span');
  const channels = await pickup.evaluate(e => getComputedStyle(e).backgroundColor.match(/\d+/g)!.map(Number));
  expect(Math.min(...channels)).toBeGreaterThan(180);
  await expect(page.locator('.interest-track')).toHaveCSS('animation-play-state', 'running');
});
