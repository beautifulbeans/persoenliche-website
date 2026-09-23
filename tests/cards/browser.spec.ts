import { test, expect } from '@playwright/test';
for (const kind of ['durak', 'arschloch', 'neunern', 'poker']) {
  test(`${kind}: legal human actions, rules, restart and mobile layout`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`/kartenspiele/?spiel=${kind}`);
    await expect(page.locator('[data-game-title]')).toHaveText(kind === 'arschloch' ? 'Arschloch' : kind === 'neunern' ? 'Neunerln' : kind[0]!.toUpperCase() + kind.slice(1));
    await expect(page.locator('[data-hand] .cg-card').first()).toBeVisible();
    await page.locator('[data-rules-open]').click();
    await expect(page.locator('[data-rules-dialog]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-rules-dialog]')).not.toBeVisible();
    if (kind === 'poker') {
      await page.getByRole('button', { name: 'Mitgehen', exact: false }).click();
    } else {
      await expect.poll(async () => await page.locator('[data-hand] button[data-playable="true"]').count() + await page.locator('[data-actions] button').count(), {timeout:10000}).toBeGreaterThan(0);
      const card = page.locator('[data-hand] button[data-playable="true"]').first();
      if (await card.count()) {
        await card.dispatchEvent('click');
        await expect(card).toHaveAttribute('aria-pressed', 'true');
        const suits = page.locator('.cg-suit-choice button');
        if (await suits.count()) await suits.first().click();
        else await page.locator('[data-actions] .cg-primary').click();
      } else await page.locator('[data-actions] button').first().click();
    }
    await page.locator('[data-new-game]').click();
    await page.locator('[data-restart-cancel]').click();
    await expect(page.locator('[data-restart-dialog]')).not.toBeVisible();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      const stage = await page.locator('.cg-table').boundingBox(); expect(stage!.x + stage!.width).toBeLessThanOrEqual(width);
      await expect(page.locator('[data-hand]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBeTruthy();
      await expect.poll(() => page.locator('[data-hand]').evaluate(el => el.scrollWidth <= el.clientWidth)).toBeTruthy();
      const actions = await page.locator('[data-actions]').boundingBox(); expect(actions!.y + actions!.height).toBeLessThanOrEqual(844);
    }
    expect(errors).toEqual([]);
  });
}
test('Site copy, contact, card launcher and one gallery end card', async ({ page }) => {
  await page.goto('/');
  const identity = page.locator('.header-identity');
  const compactIdentity = await identity.boundingBox();
  await identity.click({ position: { x: 20, y: 20 } });
  await expect(page.locator('[data-status-trigger-desktop]')).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(async () => (await identity.boundingBox())!.height).toBeGreaterThan(compactIdentity!.height + 20);
  await identity.click({ position: { x: 20, y: 20 } });
  await expect(page.locator('a[href="mailto:info@fabianderagisch.com"]')).toHaveCount(1);
  await expect(page.locator('[data-card-game="schafkopf"]')).toHaveCount(0);
  await page.locator('[data-card-game="arschloch"]').click();
  await expect(page.locator('[data-play-cards]')).toHaveAttribute('href', '/kartenspiele/?spiel=arschloch');
  await expect(page.locator('[data-play-label]')).toHaveText('Arschloch starten');
  await expect(page.locator('[data-play-cards]')).toHaveAttribute('target', '_blank');
  for (let n = 0; n < 4; n++) await page.locator('[data-camera-next]').click();
  await expect(page.locator('.camera-gallery-slide.is-active')).toBeVisible();
  await expect(page.locator('.camera-gallery-end')).toHaveCount(1);
  await expect(page.locator('.camera-image-caption')).toHaveCSS('visibility', 'hidden');
  for (const path of ['/impressum/', '/datenschutz/']) {
    await page.goto(path); await expect(page.locator('a[href="mailto:info@fabianderagisch.com"]')).toHaveCount(1);
  }
});
test('Reduced motion omits pointer pressure and card-deal motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/kartenspiele/?spiel=arschloch');
  const card = page.locator('[data-hand] button[data-playable="true"]').first();
  await card.hover(); await page.mouse.down();
  expect(await card.evaluate(el => el.getAnimations().length)).toBe(0); await page.mouse.up();
});

test('Compact fanned hand stays clickable and history does not shift the table', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/kartenspiele/?spiel=arschloch');
  const hand = page.locator('[data-hand]');
  await expect(hand.locator('button')).toHaveCount(13);
  const card = hand.locator('button[data-playable="true"]').first();
  await expect(card).toBeVisible();
  await card.click({ position: { x: 10, y: 14 } });
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-actions] .cg-primary')).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(740);
  const before = await hand.boundingBox();
  await page.locator('[data-history-open]').click();
  await expect(page.locator('[data-history-dialog]')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await hand.boundingBox()).toEqual(before);
});

test('Free sorting by keyboard and pointer preserves the hand through another turn', async ({ page }) => {
  await page.goto('/kartenspiele/?spiel=arschloch');
  const hand = page.locator('[data-hand]');
  await expect(hand.locator('.cg-card').first()).toBeVisible();
  const order = () => hand.locator('.cg-card').evaluateAll(cards=>cards.map(c=>(c as HTMLElement).dataset.cardId));
  const before = await order();
  await hand.locator('.cg-card').first().focus(); await page.keyboard.press('Alt+ArrowRight');
  const moved = await order(); expect(moved[1]).toBe(before[0]); expect(moved[0]).toBe(before[1]);
  const first = await hand.locator('.cg-card').first().boundingBox();
  const last = await hand.locator('.cg-card').last().boundingBox();
  await page.mouse.move(first!.x+10,first!.y+14); await page.mouse.down();
  await page.mouse.move(last!.x+last!.width-2,last!.y+30,{steps:12}); await page.mouse.up();
  const dragged = await order(); expect(dragged.at(-1)).toBe(moved[0]);
  const card=hand.locator('[data-playable="true"]').first();
  const played=await card.getAttribute('data-card-id'); await card.click({position:{x:10,y:14}});
  await page.locator('[data-actions] .cg-primary').click();
  expect(await order()).toEqual(dragged.filter(id=>id!==played));
});
test('Poker exposes a visual pot and raises only after confirming a chosen amount', async ({ page }) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/kartenspiele/?spiel=poker');
  await expect(page.locator('[data-game-info] .cg-chip-pile')).not.toHaveCount(0);
  await page.getByRole('button',{name:'Erhöhen',exact:true}).click();
  const panel=page.locator('[data-raise-panel]'); await expect(panel).toBeVisible();
  await panel.getByRole('button',{name:'Pot',exact:true}).click();
  const amount=await panel.locator('input').inputValue(); expect(Number(amount)).toBeGreaterThanOrEqual(40);
  await expect(page.locator('[data-player-meta]')).toContainText('990');
  await panel.getByRole('button',{name:`Setzen · ${amount}`,exact:true}).click();
  await expect(page.locator('[data-player-meta]')).toContainText(String(1000-Number(amount)));
});
test('Rules have a concise goal and independently expandable sections', async ({ page }) => {
  await page.goto('/kartenspiele/?spiel=neunern');await page.locator('[data-rules-open]').click();
  await expect(page.locator('[data-rules-body] details')).toHaveCount(4);
  await page.getByText('Die Sonderkarten',{exact:true}).click();
  await expect(page.locator('[data-rules-body]')).toContainText('7 →');
  await expect(page.locator('[data-rules-body]')).toContainText('9 →');
  await expect(page.locator('[data-rules-body] details[open]')).toHaveCount(2);
});

test('Played bot cards visibly travel from their seat to the table', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(() => {
    let seed=19;Math.random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    (window as any).__botFlight = null;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function(frames,options) {
      if (this instanceof HTMLElement && this.matches('.cg-flight[data-to="board"]:not([data-from="hand-0"])'))
        (window as any).__botFlight = (frames as Keyframe[])[0]?.transform;
      return animate.call(this,frames,options);
    };
  });
  await page.goto('/kartenspiele/?spiel=arschloch');
  const hand=page.locator('[data-hand]');
  const id=await hand.locator('.cg-card').evaluateAll(cards=>cards.map(c=>(c as HTMLElement).dataset.cardId!).sort((a,b)=>{const rank=(id:string)=>Number(id.split('-')[1])===2?15:Number(id.split('-')[1]);return rank(a)-rank(b);})[0]);
  await hand.locator(`[data-card-id="${id}"]`).dispatchEvent('click');
  await page.locator('[data-actions] .cg-primary').click();
  await expect.poll(()=>page.evaluate(() => (window as any).__botFlight),{timeout:10000}).not.toBeNull();
  const transform=await page.evaluate(() => (window as any).__botFlight);
  expect(transform).toContain('translate('); expect(transform).not.toContain('translate(0px,0px)');
});

for (const kind of ['durak','arschloch','neunern','poker']) {
  test(`${kind}: an opponent comments on the actual move without overflowing mobile`, async ({ page }) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto(`/kartenspiele/?spiel=${kind}`);
    for (let attempt=0;attempt<5 && !await page.locator('.cg-speech').count();attempt++) {
      const knock=page.getByRole('button',{name:'Auf den Tisch klopfen',exact:true});
      const card=page.locator('[data-hand] [data-playable="true"]').first();
      if (await knock.count()) await knock.click();
      else if (await card.count()) {
        await card.dispatchEvent('click');
        const suit=page.locator('.cg-suit-choice button').first();
        if (await suit.count()) await suit.click();
        else await page.locator('[data-actions] .cg-primary').click();
      } else {
        const primary=page.locator('[data-actions]>.cg-primary').first();
        const action=await primary.count()?primary:page.locator('[data-actions]>.cg-secondary').first();
        if (await action.count()) await action.click();
      }
      await page.waitForTimeout(1800);
    }
    await expect(page.locator('.cg-speech').first()).toBeVisible();
    for (const bubble of await page.locator('.cg-speech').all()) {
      const box=await bubble.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(390);
      expect((await bubble.textContent())!.length).toBeLessThan(60);
    }
  });
}

test('Trumpf stays fully visible beside the stock on desktop and mobile', async ({page}) => {
  for(const width of [920,390,320]) {
    await page.setViewportSize({width,height:814});await page.goto('/kartenspiele/?spiel=durak');
    const trump=await page.locator('.cg-trump .cg-card').boundingBox();
    const stock=await page.locator('.cg-stock-stack').boundingBox();
    expect(trump!.width).toBeGreaterThanOrEqual(width===920?69:49);
    expect(trump!.x+trump!.width).toBeLessThanOrEqual(stock!.x+1);
  }
});

test('Arschloch stacks the current trick and explains that pairs need equal values', async ({page}) => {
  await page.addInitScript(() => {
    let seed=19;Math.random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    const native=window.setTimeout.bind(window);
    const fast=(fn:TimerHandler,delay=0,...args:any[])=>native(fn,delay>=1000&&delay<=1800?15:delay,...args);
    Object.defineProperty(window,'setTimeout',{value:fast});
  });
  await page.goto('/kartenspiele/?spiel=arschloch');
  for(let turn=0;turn<80;turn++) {
    if(await page.locator('.cg-play-pile .cg-card').count()>=2) break;
    const card=page.locator('[data-hand] [data-playable="true"]').first();
    if(await card.count()) { await card.click({position:{x:10,y:14}});const play=page.locator('[data-actions] .cg-primary');if(await play.count())await play.click(); }
    else { const pass=page.getByRole('button',{name:'Passen',exact:true});if(await pass.count())await pass.click(); }
    await page.waitForTimeout(50);
  }
  const cards=page.locator('.cg-play-pile .cg-card');await expect(cards).not.toHaveCount(0);
  await expect(page.locator('.cg-pile-count')).toContainText(String(await cards.count()));
  if(await cards.count()>=2) {
    const first=await cards.nth(0).boundingBox(),second=await cards.nth(1).boundingBox();
    expect(Math.abs(first!.x-second!.x)).toBeLessThan(first!.width*.7);
  }
});

test('Poker result names the winner and shows both best five-card hands', async ({page}) => {
  await page.addInitScript(() => {
    const native=window.setTimeout.bind(window);
    const fast=(fn:TimerHandler,delay=0,...args:any[])=>native(fn,delay>=1000&&delay<=1800?10:delay,...args);
    Object.defineProperty(window,'setTimeout',{value:fast});
  });
  await page.goto('/kartenspiele/?spiel=poker');
  for(let turn=0;turn<30&&!await page.locator('[data-result]').isVisible();turn++) {
    const check=page.getByRole('button',{name:'Check',exact:true});const call=page.getByRole('button',{name:/Mitgehen/});
    if(await check.count())await check.click();else if(await call.count())await call.click();
    await page.waitForTimeout(40);
  }
  await expect(page.locator('[data-result]')).toBeVisible();
  await expect(page.locator('[data-result]')).toHaveAttribute('data-outcome',/win|loss|draw/);
  await expect(page.locator('.cg-result-emblem')).toBeVisible();
  await expect(page.locator('[data-result] h2')).toContainText(/Du|Mika|Geteilter Sieg/);
  await expect(page.locator('.cg-showdown-player')).toHaveCount(2);
  await expect(page.locator('.cg-showdown-player.is-winner')).not.toHaveCount(0);
  for(const row of await page.locator('.cg-showdown-player').all()) await expect(row.locator('.cg-card')).toHaveCount(5);
});

test('Neunerln keeps a visibly layered discard pile as play continues', async ({page}) => {
  await page.addInitScript(() => {
    let seed=31;Math.random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    const native=window.setTimeout.bind(window);
    const fast=(fn:TimerHandler,delay=0,...args:any[])=>native(fn,delay>=1000&&delay<=1800?12:delay,...args);
    Object.defineProperty(window,'setTimeout',{value:fast});
  });
  await page.goto('/kartenspiele/?spiel=neunern');
  for(let turn=0;turn<36&&await page.locator('.cg-discard-pile .cg-card').count()<2;turn++) {
    const knock=page.getByRole('button',{name:'Auf den Tisch klopfen',exact:true});
    const card=page.locator('[data-hand] [data-playable="true"]').first();
    if(await knock.count()) await knock.click();
    else if(await card.count()) {
      await card.click({position:{x:10,y:14}});
      const suit=page.locator('.cg-suit-choice button').first();
      if(await suit.count()) await suit.click(); else await page.locator('[data-actions] .cg-primary').click();
    } else {
      const action=page.locator('[data-actions] button').first(); if(await action.count()) await action.click();
    }
    await page.waitForTimeout(35);
  }
  const pile=page.locator('.cg-discard-pile');
  await expect.poll(()=>pile.locator('.cg-card').count()).toBeGreaterThanOrEqual(2);
  const first=await pile.locator('.cg-card').nth(0).boundingBox(), second=await pile.locator('.cg-card').nth(1).boundingBox();
  expect(Math.abs(first!.x-second!.x)).toBeLessThan(first!.width*.5);
  await expect(pile.locator('.cg-pile-count')).toHaveAttribute('aria-label',/Karten auf dem Stapel/);
});

test('Status island uses the full hover surface and a calm portrait expansion', async ({page}) => {
  await page.setViewportSize({width:1440,height:814});await page.goto('/');
  const identity=page.locator('.header-identity');await identity.hover({position:{x:390,y:25}});
  expect(await identity.evaluate(el=>getComputedStyle(el).cursor)).toBe('pointer');
  const avatar=page.locator('.header-identity .wordmark-avatar');
  expect(await avatar.evaluate(el=>getComputedStyle(el).transitionDuration.split(',')[0])).toBe('0.98s');
  await identity.click({position:{x:390,y:25}});
  await expect(page.locator('[data-status-trigger-desktop]')).toHaveAttribute('aria-expanded','true');
});
