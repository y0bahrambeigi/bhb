document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;});}));
const input=document.querySelector('#paper-search');
if(input)input.addEventListener('input',()=>{let count=0;const q=input.value.trim().normalize('NFKC').replace(/ي/g,'ی').replace(/ك/g,'ک').toLowerCase();document.querySelectorAll('.paper').forEach(p=>{const s=p.textContent.normalize('NFKC').replace(/ي/g,'ی').replace(/ك/g,'ک').toLowerCase();p.hidden=!s.includes(q);if(!p.hidden)count++;});document.querySelector('#no-results').hidden=count>0;});
document.querySelector('#print-resume')?.addEventListener('click',()=>window.print());
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','باز کردن منو');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'بستن منو':'باز کردن منو');nav?.classList.toggle('open',open);});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu?.focus();}});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;nav?.querySelectorAll('a').forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-15% 0px -60% 0px'});document.querySelectorAll('main>section[id]').forEach(s=>observer.observe(s));}
