/* Workout Prep landing page motion. No library, no network request.
   Runs only when motion is allowed. It hides nothing in the HTML: elements are hidden
   here, just before they are revealed, so with JavaScript off everything shows. */
(function () {
  var w = window, d = document;
  if (!w.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in w)) return;
  d.documentElement.classList.add('motion');

  d.addEventListener('DOMContentLoaded', function () {
    // Hero: the headline, lead and button rise into place, staggered in the CSS.
    var hero = d.querySelectorAll('.rise');
    hero.forEach(function (el) { el.classList.add('pre'); });
    void d.body.offsetWidth; // commit the start state, so the change below transitions
    hero.forEach(function (el) { el.classList.remove('pre'); });

    // Sections and cards rise and fade in once, as they enter the viewport.
    var reveal = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = Math.min(k++, 4) * 70 + 'ms';
        e.target.classList.remove('pre');
        reveal.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    var waiting = [];
    d.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top < w.innerHeight) return; // already on screen: leave it be
      el.classList.add('pre');
      reveal.observe(el);
      waiting.push(el);
    });
    // A long jump (End key, a link) can pass an element between two frames, so the
    // observer never sees it. When scrolling settles, show anything in view or above.
    var settle;
    w.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        waiting = waiting.filter(function (el) {
          if (!el.classList.contains('pre')) return false;
          if (el.getBoundingClientRect().top > w.innerHeight) return true;
          el.classList.remove('pre');
          reveal.unobserve(el);
          return false;
        });
      }, 120);
    }, { passive: true });

    // The packing demo ticks its items one by one, once, then stays still.
    var demo = d.getElementById('kit-demo');
    if (demo) {
      var items = demo.querySelectorAll('.kit li'), n = items.length, c = 0,
          done = d.getElementById('kit-done'), bar = d.getElementById('kit-bar');
      var show = function () { done.textContent = c; bar.style.transform = 'scaleX(' + c / n + ')'; };
      items.forEach(function (li) { li.classList.add('todo'); });
      show();
      var kit = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        kit.disconnect();
        demo.classList.add('ticking');
        var timer = setInterval(function () {
          items[c].classList.remove('todo');
          c++;
          show();
          if (c >= n) clearInterval(timer);
        }, 380);
      }, { threshold: 0.5 });
      kit.observe(demo);
    }

    // The gallery nudges sideways once, the first time it is seen, to show it scrolls.
    var g = d.getElementById('gallery'), track = g && g.querySelector('.track');
    if (track) {
      var stop = function () { track.classList.remove('nudge'); };
      var nudge = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        nudge.disconnect();
        if (g.scrollWidth > g.clientWidth + 8 && g.scrollLeft < 4) {
          track.classList.add('nudge');
          track.addEventListener('animationend', stop, { once: true });
        }
      }, { threshold: 0.6 });
      nudge.observe(g);
      g.addEventListener('pointerdown', function () { nudge.disconnect(); stop(); }, { once: true });
    }
  });
})();
