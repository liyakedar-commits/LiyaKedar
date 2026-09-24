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
      ['About', 'About.dc.html', '/about/'],
      ['Home', 'Home.dc.html', '/']
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
        'h1',                              // welcome sentence
        '[data-grid] > a > div:last-child' // home card labels
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
    var id = setInterval(function () { scan(); scanText(); if (++n > 24) clearInterval(id); }, 400);
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
    panel.style.cssText = 'position:fixed;inset:0;z-index:9001;background:' + CREAM + ';color:' + INK + ';' +
      'display:none;flex-direction:column;justify-content:flex-start;gap:0;padding:58px 0 0;' +
      "font-family:'Authentic Sans 90',sans-serif;text-transform:uppercase;letter-spacing:.3px";

    var all = links();
    all.forEach(function (l, i) {
      var a = document.createElement('a');
      a.href = l[1];
      a.textContent = l[0];
      a.style.cssText = 'color:' + INK + ';text-decoration:none;font-weight:400;' +
        'font-size:clamp(19px,min(6.6vw,3.0vh),26px);line-height:1.15;white-space:nowrap;padding:15px 24px;' +
        (i < all.length - 1 ? 'border-bottom:2px solid ' + INK : '');
      panel.appendChild(a);
    });

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close menu');
    close.style.cssText = 'position:absolute;top:6px;right:8px;width:44px;height:44px;border:none;' +
      'background:transparent;padding:0;display:flex;align-items:center;justify-content:center';
    // two hairline strokes, same 2px weight as the menu button
    [45, -45].forEach(function (deg) {
      var s = document.createElement('span');
      s.style.cssText = 'position:absolute;width:20px;height:2px;background:' + INK +
        ';transform:rotate(' + deg + 'deg)';
      close.appendChild(s);
    });
    panel.appendChild(close);

    function open() { panel.style.display = 'flex'; btn.style.display = 'none'; document.body.style.overflow = 'hidden'; }
    function shut() { panel.style.display = 'none'; btn.style.display = 'flex'; document.body.style.overflow = ''; }
    btn.addEventListener('click', open);
    close.addEventListener('click', shut);

    buildFooter();
    retryFooter();
    reveal();

    document.body.appendChild(btn);
    document.body.appendChild(panel);
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
      document.body.classList.remove('has-mobile-nav');
      document.body.style.overflow = '';
    } else {
      build();
    }
  });
})();
