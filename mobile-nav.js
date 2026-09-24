/* Phone-only navigation: a menu button that opens the project list.
   Above 700px this script does nothing at all. */
(function () {
  var MQ = '(max-width: 700px)';
  var INK = '#0D2565', CREAM = '#F8F8F6';

  function slugMode() {
    // the published site serves slug folders; the source files end in .dc.html
    return !/\.dc\.html$/i.test(location.pathname);
  }

  function links() {
    var slug = slugMode();
    var items = [
      ['Hopp by Wix', 'Project-Kisses.dc.html', '/hopp/'],
      ['Eden Cinema', 'Project-Eden.dc.html', '/eden-cinema/'],
      ['Fetch / Guilty Pleasures', 'Project-Fetch.dc.html', '/fetch/'],
      ["Here's How It Happened", 'Project-Happened.dc.html', '/heres-how-it-happened/'],
      ['Hibi', 'Project-Hibi.dc.html', '/hibi/'],
      ['About', 'About.dc.html', '/about/']
    ];
    return items.map(function (it) { return [it[0], slug ? it[2] : it[1]]; });
  }


  function buildFooter() {
    var bar = document.querySelector('div[data-nav-page]');
    if (!bar || bar.querySelector('.mnav-foot')) return;
    var slug = slugMode();
    var urls = {
      hopp: ['Project-Kisses.dc.html', '/hopp/'],
      eden: ['Project-Eden.dc.html', '/eden-cinema/'],
      fetch: ['Project-Fetch.dc.html', '/fetch/'],
      happened: ['Project-Happened.dc.html', '/heres-how-it-happened/'],
      hibi: ['Project-Hibi.dc.html', '/hibi/']
    };
    var here = bar.getAttribute('data-nav-page');
    // the next project is always Hopp, except on Hopp itself, where it is Eden
    var next = here === 'hopp' ? 'eden' : 'hopp';
    var base = "color:" + INK + ";text-decoration:none;line-height:58px;padding:0 16px;white-space:nowrap;" +
      "font-family:'Authentic Sans 130',sans-serif;font-size:14px;letter-spacing:.3px;";
    function mk(label, href) {
      var a = document.createElement('a');
      a.className = 'mnav-foot';
      a.href = href;
      a.textContent = label;
      a.style.cssText = base;
      return a;
    }
    bar.appendChild(mk('ALL PROJECTS', slug ? '/' : 'Home.dc.html'));
    bar.appendChild(mk('NEXT PROJECT', urls[next][slug ? 1 : 0]));
  }

  function retryFooter() {
    // project pages render their markup asynchronously, so the footer bar may not exist yet
    var tries = 0;
    var id = setInterval(function () {
      tries++;
      buildFooter();
      if (tries > 40 || document.querySelector('.mnav-foot')) clearInterval(id);
    }, 250);
  }


  function reveal() {
    if (!('IntersectionObserver' in window)) return;
    var vw = window.innerWidth;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.opacity = '1';
        en.target.style.transform = 'none';
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    function scan() {
      var nodes = document.querySelectorAll('img, video, iframe');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.dataset.reveal) continue;
        if (el.closest('[data-grid], [data-nav-page], #mnav-panel, #liya-gate')) continue;
        // add-blocks cards already rise with the page's own entrance
        if (el.matches('img[src*="hopp-add-"], img[src*="hopp-block-"]')) continue;
        var show = el.closest('[data-vcshow], [data-vcgal]');
        if (show) {
          // the visual-content showcase rises as one box; its slides only crossfade
          el.dataset.reveal = '1';
          if (show.dataset.reveal) continue;
          show.dataset.reveal = '1';
          show.style.opacity = '0';
          show.style.transform = 'translateY(26px)';
          show.style.transition = 'opacity 1.1s cubic-bezier(.22,.61,.36,1), transform 1.1s cubic-bezier(.22,.61,.36,1)';
          io.observe(show);
          continue;
        }
        var cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;
        var target = el;
        if (cs.position === 'absolute') {
          // full-bleed art inside a framed box: animate the box, not the art
          var box = el.parentElement;
          if (!box || box.dataset.reveal) continue;
          var bcs = getComputedStyle(box);
          if (bcs.position !== 'relative' && bcs.position !== 'sticky') continue;
          target = box;
        }
        var r = target.getBoundingClientRect();
        if (r.width < vw * 0.5 || r.height < 80) continue;
        el.dataset.reveal = '1';
        target.dataset.reveal = '1';
        target.style.opacity = '0';
        target.style.transform = 'translateY(26px)';
        target.style.transition = 'opacity 1.1s cubic-bezier(.22,.61,.36,1), transform 1.1s cubic-bezier(.22,.61,.36,1)';
        io.observe(target);
      }
    }

    // the About stack rises in sequence when the page opens
    var about = document.querySelector('[data-about-mobile]');
    if (about) {
      [].slice.call(about.children).forEach(function (el, i) {
        if (el.dataset.reveal) return;
        el.dataset.reveal = '1';
        el.style.opacity = '0';
        el.style.transform = 'translateY(22px)';
        el.style.transition = 'opacity 1s cubic-bezier(.22,.61,.36,1) ' + (i * 140) + 'ms, transform 1s cubic-bezier(.22,.61,.36,1) ' + (i * 140) + 'ms';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'none'; });
        });
      });
    }

    function scanText() {
      var sel = [
        'div[style*="30vw"] > div',        // project title / discipline / description
        '.hopp-textcol > div',             // hopp case-study texts
        'h1'                               // welcome sentence
      ].join(', ');
      var nodes = document.querySelectorAll(sel);
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.dataset.reveal) continue;
        if (el.closest('[data-nav-page], #mnav-panel, #liya-gate')) continue;
        if (!el.textContent || !el.textContent.trim()) continue;
        var idx = 0, sib = el.previousElementSibling;
        while (sib) { idx++; sib = sib.previousElementSibling; }
        var delay = Math.min(idx, 4) * 110;
        el.dataset.reveal = '1';
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        el.style.transition = 'opacity .95s cubic-bezier(.22,.61,.36,1) ' + delay + 'ms, transform .95s cubic-bezier(.22,.61,.36,1) ' + delay + 'ms';
        io.observe(el);
      }
    }
    scanText();
    scan();
    var n = 0;
    var id = setInterval(function () { scan(); scanText(); showcase(); swipeGallery(); if (++n > 24) clearInterval(id); }, 400);
    var gid = setInterval(function () {
      swipeGallery(); showcase();
      var g = document.querySelector('[data-vcgal]');
      if ((!g || g.dataset.auto) && (!document.querySelector('[data-vcshow]') || document.querySelector('[data-vcshow]').dataset.cycling)) {
        if (++gn > 60) clearInterval(gid);
      }
    }, 500), gn = 0;
  }

  // hopp card gallery: a transform-driven endless strip. The six cards sit
  // between two silent copies of themselves; the focused card is always
  // centred, the strip follows the finger, settles with an ease, and
  // advances on its own when left alone.
  function swipeGallery() {
    var box = document.querySelector('[data-vcgal]');
    if (!box || box.dataset.auto) return;
    var orig = [].slice.call(box.querySelectorAll(':scope > img:not([data-clone])'));
    if (orig.length < 2 || !box.clientWidth) return;
    box.dataset.auto = '1';
    var n = orig.length;
    function copy(img) {
      var c = img.cloneNode(true);
      c.alt = ''; c.setAttribute('aria-hidden', 'true'); c.dataset.clone = '1';
      c.removeAttribute('loading');
      return c;
    }
    orig.forEach(function (img) { img.removeAttribute('loading'); box.appendChild(copy(img)); });
    for (var k = n - 1; k >= 0; k--) box.insertBefore(copy(orig[k]), box.firstChild);
    var cards = [].slice.call(box.querySelectorAll(':scope > img'));

    var p = n;              // focused position, in cards (float while moving)
    var anim = null, touching = false, holdUntil = 0;
    var curX = 0;
    // exact sub-pixel geometry: both cards carry the same transform, so the
    // distance between them is the true step; subtract curX for the rest pose
    function geo() {
      var b = box.getBoundingClientRect(), r0 = cards[0].getBoundingClientRect(), r1 = cards[1].getBoundingClientRect();
      return { w: r0.width, step: r1.left - r0.left, base: r0.left - b.left - curX, bw: b.width };
    }
    function paint() {
      var g = geo();
      var x = g.bw / 2 - (g.base + p * g.step + g.w / 2);
      curX = x;
      var t = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      for (var i = 0; i < cards.length; i++) cards[i].style.transform = t;
    }
    function wrap() {
      if (p >= 2 * n) p -= n;
      else if (p < n) p += n;
    }
    function stop() { if (anim) { cancelAnimationFrame(anim); anim = null; } }
    function ease(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
    function glide(to, dur) {
      stop();
      var from = p, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        p = from + (to - from) * ease(k);
        paint();
        if (k < 1) anim = requestAnimationFrame(step);
        else { anim = null; p = to; wrap(); paint(); }
      }
      anim = requestAnimationFrame(step);
    }
    paint();
    window.addEventListener('resize', paint);

    var sx = 0, sy = 0, sp = 0, lastX = 0, lastT = 0, vel = 0, mode = null;
    box.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      stop(); wrap(); paint();
      touching = true; mode = null;
      sx = lastX = t.clientX; sy = t.clientY; sp = p; lastT = Date.now(); vel = 0;
    }, { passive: true });
    box.addEventListener('touchmove', function (e) {
      if (!touching) return;
      var t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (!mode) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        mode = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (mode !== 'x') return;
      var g = geo(), now = Date.now();
      vel = (t.clientX - lastX) / Math.max(1, now - lastT);
      lastX = t.clientX; lastT = now;
      p = sp - dx / g.step;
      paint();
    }, { passive: true });
    function release() {
      if (!touching) return;
      touching = false;
      holdUntil = Date.now() + 3000;
      if (mode !== 'x') return;
      var base = Math.round(sp), target = Math.round(p);
      if (target === base && Math.abs(vel) > 0.3) target = base + (vel < 0 ? 1 : -1);
      target = Math.max(base - 1, Math.min(base + 1, target));
      glide(target, 520);
    }
    box.addEventListener('touchend', release, { passive: true });
    box.addEventListener('touchcancel', release, { passive: true });

    setInterval(function () {
      if (!window.matchMedia(MQ).matches) return;
      if (touching || anim || Date.now() < holdUntil || document.hidden) return;
      var br = box.getBoundingClientRect();
      if (br.bottom < 0 || br.top > window.innerHeight) return;
      wrap();
      glide(Math.round(p) + 1, 1100);
    }, 2600);
  }

  // hopp visual content: one fixed frame, each composition held ~2s, quick crossfade
  function showcase() {
    var box = document.querySelector('[data-vcshow]');
    if (!box || box.dataset.cycling) return;
    var slides = box.querySelectorAll(':scope > img');
    if (slides.length < 2) return;
    box.dataset.cycling = '1';
    var i = 0;
    slides[0].setAttribute('data-on', '');
    setInterval(function () {
      if (!window.matchMedia(MQ).matches) return;
      slides[i].removeAttribute('data-on');
      i = (i + 1) % slides.length;
      slides[i].setAttribute('data-on', '');
    }, 2000);
  }

  function build() {
    if (!window.matchMedia(MQ).matches) return;
    if (document.getElementById('mnav-btn')) return;
    document.body.classList.add('has-mobile-nav');

    var btn = document.createElement('button');
    btn.id = 'mnav-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menu');
    btn.style.cssText = 'position:fixed;top:6px;right:8px;z-index:9000;width:44px;height:44px;' +
      'display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;' +
      'border:none;background:transparent;padding:0';
    for (var i = 0; i < 3; i++) {
      var bar = document.createElement('span');
      bar.style.cssText = 'display:block;width:20px;height:2px;background:' + INK;
      btn.appendChild(bar);
    }

    var panel = document.createElement('nav');
    panel.id = 'mnav-panel';
    // a fixed frame under the header clips a sheet that slides down out of it
    // (transform only, so it stays on the compositor and moves smoothly)
    // the frame is only as tall as the menu, so it ends at the rule under About
    panel.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:9001;overflow:hidden;' +
      'visibility:hidden;pointer-events:none;color:' + INK + ';' +
      "font-family:'Authentic Sans 130',sans-serif;text-transform:uppercase;letter-spacing:.3px";
    var sheet = document.createElement('div');
    sheet.style.cssText = 'background:' + CREAM + ';display:flex;flex-direction:column;' +
      'justify-content:flex-start;gap:0;padding:0;transform:translate3d(0,-100%,0);will-change:transform;' +
      'transition:transform .34s cubic-bezier(.3,0,.2,1)';
    panel.appendChild(sheet);
    sheet.addEventListener('transitionend', function (e) {
      if (e.target !== sheet || e.propertyName !== 'transform' || !panel._closing) return;
      panel._closing = false;
      clearTimeout(panel._hide);
      panel.style.visibility = 'hidden';
    });

    var all = links();
    all.forEach(function (l, i) {
      var a = document.createElement('a');
      a.href = l[1];
      a.textContent = l[0];
      a.style.cssText = 'color:' + INK + ';text-decoration:none;font-weight:400;' +
        'font-size:clamp(19px,min(6.6vw,3.0vh),26px);line-height:1.15;white-space:nowrap;padding:15px 24px;' +
        'border-bottom:2px solid ' + INK;
      sheet.appendChild(a);
    });

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close menu');
    // the X takes the hamburger's exact spot inside the header
    close.style.cssText = 'position:fixed;top:6px;right:8px;z-index:9002;width:44px;height:44px;border:none;' +
      'background:transparent;padding:0;display:none;align-items:center;justify-content:center';
    // two hairline strokes, same 2px weight as the menu button
    [45, -45].forEach(function (deg) {
      var s = document.createElement('span');
      s.style.cssText = 'position:absolute;width:20px;height:2px;background:' + INK +
        ';transform:rotate(' + deg + 'deg)';
      close.appendChild(s);
    });

    // the menu hangs from the header's bottom rule, so the header stays in view
    function headerBottom() {
      var h = document.querySelector('div[data-screen-label] > div:first-child');
      if (!h) return 0;
      var b = h.getBoundingClientRect().bottom;
      var n = h.nextElementSibling;
      if (n && n.offsetHeight > 0 && n.offsetHeight <= 3) b = n.getBoundingClientRect().bottom;
      return Math.max(0, Math.round(b));
    }
    function open() {
      panel.style.top = headerBottom() + 'px';
      close.style.display = 'flex';
      clearTimeout(panel._hide);
      panel._closing = false;
      panel.style.visibility = 'visible'; panel.style.pointerEvents = 'auto';
      sheet.getBoundingClientRect();
      sheet.style.transform = 'translate3d(0,0,0)';
      btn.style.display = 'none'; document.body.style.overflow = 'hidden';
    }
    function shut() {
      sheet.style.transform = 'translate3d(0,-100%,0)';
      panel.style.pointerEvents = 'none';
      clearTimeout(panel._hide);
      panel._closing = true;
      // fallback only - the real hide happens on the sheet's transitionend
      panel._hide = setTimeout(function () { if (panel._closing) { panel._closing = false; panel.style.visibility = 'hidden'; } }, 1200);
      close.style.display = 'none';
      btn.style.display = 'flex'; document.body.style.overflow = '';
    }
    btn.addEventListener('click', open);
    // the page shows below the shorter menu - a tap there just closes it
    document.addEventListener('click', function (e) {
      if (panel.style.pointerEvents !== 'auto') return;
      if (panel.contains(e.target) || close.contains(e.target) || btn.contains(e.target)) return;
      e.preventDefault(); e.stopPropagation();
      shut();
    }, true);
    close.addEventListener('click', shut);

    buildFooter();
    retryFooter();
    reveal();

    document.body.appendChild(btn);
    document.body.appendChild(panel);
    document.body.appendChild(close);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
  window.addEventListener('resize', function () {
    if (!window.matchMedia(MQ).matches) {
      var b = document.getElementById('mnav-btn'), p = document.getElementById('mnav-panel');
      if (b) b.remove();
      if (p) p.remove();
      var c = document.querySelector('button[aria-label="Close menu"]'); if (c) c.remove();
      document.body.classList.remove('has-mobile-nav');
      document.body.style.overflow = '';
    } else {
      build();
    }
  });
})();
