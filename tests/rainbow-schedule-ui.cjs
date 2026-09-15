const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});try{for(const width of [320,390,1400]){
 const p=await b.newPage({viewport:{width,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto((process.env.TEST_URL||'http://127.0.0.1:8767/')+'?scheduleQA='+Date.now()+'#rainbow-schedule');
 await p.waitForFunction(()=>typeof data!=='undefined'&&data?.soccerProjections);
 assert.equal(await p.locator('#tab-rainbow-schedule').count(),1,'dedicated Rainbow schedule tab');
 assert.equal(await p.locator('#tab-rainbow-schedule').innerText(),'Rainbow schedule');
 assert.equal(await p.locator('#rainbow-schedule').isVisible(),true);assert.equal(await p.locator('#shared-filters').isVisible(),false);
 const expected=await p.evaluate(()=>data.divisions.filter(d=>d.sport==='5ug'&&d.division==='Boxx').flatMap(d=>d.schedule.flatMap((g,i)=>[g.home,g.away].includes('Rainbow Unicorns')?[{...g,id:JSON.stringify([d.sport,d.division,i])}]:[])).sort((a,b)=>Date.parse(a.start_iso)-Date.parse(b.start_iso)));
 const rows=p.locator('#rainbow-schedule [data-league-fixture]');assert.equal(expected.length,11);assert.equal(await rows.count(),expected.length);
 assert.deepEqual(await rows.evaluateAll(es=>es.map(e=>e.dataset.leagueFixture)),expected.map(g=>g.id));
 for(let i=0;i<expected.length;i++){const g=expected[i],r=rows.nth(i),text=await r.innerText();assert.ok(text.includes(g.away)&&text.includes(g.home));assert.equal(await r.locator('.field-map').getAttribute('href'),g.location_url);const final=Number.isInteger(g.home_score)&&Number.isInteger(g.away_score);assert.equal(await r.locator('.league-score').count(),final?1:0);if(final)assert.equal(await r.locator('.league-score').innerText(),`${g.away_score}–${g.home_score} Final`);assert.ok(text.includes(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}).format(new Date(g.start_iso))));}
 await rows.first().locator('summary').press('Enter');assert.ok(await rows.first().getAttribute('open')!==null);assert.match(await rows.first().innerText(),/Coach:/);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('#rainbow-schedule').scrollWidth<=document.querySelector('#rainbow-schedule').clientWidth));
 assert.ok(await p.locator('.section-links button').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44&&e.scrollWidth<=e.clientWidth)));
 await p.screenshot({path:`/tmp/rainbow-schedule-${width}.png`,fullPage:true});
 await p.locator('#tab-rainbow-schedule').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#tab-rankings').getAttribute('aria-selected'),'true');
 await p.locator('#division').selectOption('Akers');await p.locator('#search').fill('no match');await p.locator('#tab-rainbow-schedule').click();assert.equal(await rows.count(),11);
 await p.locator('#tab-rainbow-schedule').focus();await p.keyboard.press('End');assert.equal(await p.locator('#tab-league-schedule').getAttribute('aria-selected'),'true');await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#tab-rainbow-unicorns').getAttribute('aria-selected'),'true');await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('#tab-league-schedule').getAttribute('aria-selected'),'true');await p.keyboard.press('Home');assert.equal(await p.locator('#tab-rainbow-unicorns').getAttribute('aria-selected'),'true');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({width,fixtures:expected.length,final:expected.filter(g=>Number.isInteger(g.home_score)).length,unplayed:expected.filter(g=>!Number.isInteger(g.home_score)).length,verified:'exact identities, chronology, CT, scores, maps, hash, keyboard, filter independence, no overflow/errors'}));await p.close();
 }}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
