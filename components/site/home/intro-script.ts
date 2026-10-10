/**
 * The homepage's first-visit intro (docs/design/choreography.md §1), run as an inline script while
 * the HTML is still parsing so its timing starts at first paint instead of after React hydrates.
 *
 * It never touches React-owned elements: it only sets attributes and two custom properties on <html>
 * (which React doesn't reconcile), and the CSS in marketing.css reacts to them:
 *   data-ann="off"            announcement bar dismissed this session
 *   data-stage="pre"          stage windows waiting to rise
 *   data-intro="run go leave" overlay showing / dots popped / dots gliding and overlay fading
 * When it's done it dispatches "ml:intro-done" so the rebrand notice can follow it.
 *
 * Reduced motion: none of this runs, and nothing waits.
 */
export const INTRO_SCRIPT = `(function(){
var d=document.documentElement,w=window,timers=[];
function seenGet(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
if(seenGet('ml-ann')==='0')d.setAttribute('data-ann','off');
var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
function done(){w.__mlIntroDone=true;try{w.dispatchEvent(new Event('ml:intro-done'))}catch(e){}}
if(reduce){done();return}
function reveal(){d.removeAttribute('data-stage')}
d.setAttribute('data-stage','pre');
if(seenGet('ml-intro')==='1'){done();requestAnimationFrame(function(){requestAnimationFrame(reveal)});return}
d.setAttribute('data-intro','run');
function at(ms,fn){timers.push(setTimeout(fn,ms))}
function finish(){
  if(w.__mlIntroDone)return;
  timers.forEach(clearTimeout);
  d.removeAttribute('data-intro');d.style.removeProperty('--intro-x');d.style.removeProperty('--intro-y');
  reveal();
  try{sessionStorage.setItem('ml-intro','1')}catch(e){}
  done();
}
at(60,function(){d.setAttribute('data-intro','run go')});
at(820,function(){
  var a=document.getElementById('introDots'),b=document.getElementById('heroDots');
  if(a&&b){var r=a.getBoundingClientRect(),t=b.getBoundingClientRect();
    d.style.setProperty('--intro-x',(t.left-r.left)+'px');d.style.setProperty('--intro-y',(t.top-r.top)+'px')}
  d.setAttribute('data-intro','run go leave');
});
at(1240,function(){d.setAttribute('data-intro','go leave')});
at(1540,finish);
var o=document.getElementById('intro');if(o)o.addEventListener('click',finish);
w.__mlIntroSkip=finish;
})();`
