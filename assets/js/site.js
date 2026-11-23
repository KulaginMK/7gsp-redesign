(function () {
  'use strict';

  var STORAGE_KEY = '7gsp_a11y_v1';
  var LANG_KEY = '7gsp_lang_v1';
  var root = document.documentElement;

  /* ------------------------------------------------------------------------
     1. ВЕРСИЯ ДЛЯ СЛАБОВИДЯЩИХ (сохраняется между страницами)
     ------------------------------------------------------------------------ */
  var defaultState = {
    open: false,
    font: 'md',
    theme: 'default',
    images: 'on',
    spacing: 'normal'
  };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? Object.assign({}, defaultState, JSON.parse(raw)) : Object.assign({}, defaultState);
    } catch (e) {
      return Object.assign({}, defaultState);
    }
  }

  function saveState(st) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch (e) {}
  }

  var state = loadState();

  function applyA11y() {
    root.setAttribute('data-font', state.font);
    root.setAttribute('data-theme', state.theme);
    root.setAttribute('data-images', state.images);
    root.setAttribute('data-spacing', state.spacing);

    var panel = document.getElementById('a11yPanel');
    var toggleBtn = document.getElementById('a11yToggle');
    if (panel) panel.classList.toggle('is-open', !!state.open);
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', state.open ? 'true' : 'false');

    document.querySelectorAll('[data-a11y-font]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-a11y-font') === state.font ? 'true' : 'false');
    });
    document.querySelectorAll('[data-a11y-theme]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-a11y-theme') === state.theme ? 'true' : 'false');
    });
    document.querySelectorAll('[data-a11y-images]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-a11y-images') === state.images ? 'true' : 'false');
    });
    document.querySelectorAll('[data-a11y-spacing]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-a11y-spacing') === state.spacing ? 'true' : 'false');
    });
  }

  applyA11y();

  document.addEventListener('click', function (e) {
    var t = e.target.closest('#a11yToggle');
    if (t) {
      state.open = !state.open;
      if (state.open && state.font === 'md' && state.theme === 'default') {
        state.font = 'lg';
      }
      saveState(state);
      applyA11y();
      return;
    }

    var fBtn = e.target.closest('[data-a11y-font]');
    if (fBtn) {
      state.font = fBtn.getAttribute('data-a11y-font');
      saveState(state);
      applyA11y();
      return;
    }

    var thBtn = e.target.closest('[data-a11y-theme]');
    if (thBtn) {
      state.theme = thBtn.getAttribute('data-a11y-theme');
      saveState(state);
      applyA11y();
      return;
    }

    var imBtn = e.target.closest('[data-a11y-images]');
    if (imBtn) {
      state.images = imBtn.getAttribute('data-a11y-images');
      saveState(state);
      applyA11y();
      return;
    }

    var spBtn = e.target.closest('[data-a11y-spacing]');
    if (spBtn) {
      state.spacing = spBtn.getAttribute('data-a11y-spacing');
      saveState(state);
      applyA11y();
      return;
    }

    if (e.target.closest('#a11yReset')) {
      state = Object.assign({}, defaultState);
      saveState(state);
      applyA11y();
      return;
    }

    if (e.target.closest('[data-print]')) {
      window.print();
      return;
    }
  });

  /* ------------------------------------------------------------------------
     2. МОБИЛЬНОЕ МЕНЮ И РАСКРЫВАЮЩИЙСЯ СПИСОК «ЕЩЁ РАЗДЕЛЫ» (ПО КЛИКУ)
     ------------------------------------------------------------------------ */
  var mobileToggle = document.getElementById('navMobileToggle');
  var navList = document.getElementById('navList');
  if (mobileToggle && navList) {
    mobileToggle.addEventListener('click', function () {
      var open = navList.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var moreBtn = document.getElementById('navMoreBtn');
  var moreMenu = document.getElementById('navMoreMenu');
  if (moreBtn && moreMenu) {
    moreBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = moreMenu.classList.toggle('is-open');
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-more-wrap')) {
        moreMenu.classList.remove('is-open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        moreMenu.classList.remove('is-open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК (TABS) С ПОДДЕРЖКОЙ ЯКОРЕЙ В URL (#...)
     ------------------------------------------------------------------------ */
  function activateTab(container, tabId) {
    var buttons = container.querySelectorAll('[role="tab"]');
    var panels = container.querySelectorAll('[role="tabpanel"]');
    var found = false;
    buttons.forEach(function (btn) {
      var target = btn.getAttribute('data-tab-target');
      var isMatch = target === tabId;
      if (isMatch) found = true;
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
    if (!found && buttons.length) {
      tabId = buttons[0].getAttribute('data-tab-target');
      buttons[0].setAttribute('aria-selected', 'true');
    }
    panels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.id === tabId);
    });
  }

  document.querySelectorAll('[data-tabs]').forEach(function (container) {
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[role="tab"]');
      if (!btn) return;
      var target = btn.getAttribute('data-tab-target');
      activateTab(container, target);
      if (history.replaceState) {
        history.replaceState(null, '', '#' + target);
      }
    });

    function syncHash() {
      var h = (window.location.hash || '').replace(/^#/, '');
      if (h && container.querySelector('[data-tab-target="' + h + '"]')) {
        activateTab(container, h);
      }
    }
    syncHash();
    window.addEventListener('hashchange', syncHash);
  });

  /* ------------------------------------------------------------------------
     4. ЖИВОЙ ПОИСК ПО ТАБЛИЦАМ (РАЙОН ОБСЛУЖИВАНИЯ, ПРЕЙСКУРАНТ)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-table-filter]').forEach(function (input) {
    var scopeSel = input.getAttribute('data-table-filter');
    var statusEl = document.getElementById(input.getAttribute('data-status-id'));
    var clearBtn = document.getElementById(input.getAttribute('data-clear-id'));

    function runFilter() {
      var q = input.value.trim().toLowerCase();
      var scope = document.querySelector(scopeSel) || document;
      var rows = scope.querySelectorAll('tbody tr');
      var matched = 0;
      var total = 0;

      rows.forEach(function (tr) {
        if (tr.querySelector('th')) return;
        total++;
        var text = (tr.textContent || '').toLowerCase();
        if (!q) {
          tr.classList.remove('is-hidden', 'is-match');
          matched++;
        } else if (text.indexOf(q) !== -1) {
          tr.classList.remove('is-hidden');
          tr.classList.add('is-match');
          matched++;
        } else {
          tr.classList.add('is-hidden');
          tr.classList.remove('is-match');
        }
      });

      if (statusEl) {
        if (!q) {
          statusEl.textContent = 'Всего строк в списке: ' + total + '. Начните вводить название — таблица отфильтруется сразу.';
        } else if (matched > 0) {
          statusEl.textContent = 'Найдено совпадений: ' + matched + ' (подсвечены жёлтым цветом).';
        } else {
          statusEl.textContent = 'По запросу «' + input.value.trim() + '» ничего не найдено. Попробуйте сократить слово или позвоните в регистратуру.';
        }
      }
    }

    input.addEventListener('input', runFilter);
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        runFilter();
        input.focus();
      });
    }
    runFilter();
  });

  /* ------------------------------------------------------------------------
     5. РАСКРЫТЬ / СВЕРНУТЬ ВСЕ АККОРДЕОНЫ
     ------------------------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    var exp = e.target.closest('[data-expand-all]');
    if (exp) {
      var scope = document.querySelector(exp.getAttribute('data-expand-all')) || document;
      scope.querySelectorAll('details.accordion').forEach(function (d) { d.open = true; });
    }
    var col = e.target.closest('[data-collapse-all]');
    if (col) {
      var scope2 = document.querySelector(col.getAttribute('data-collapse-all')) || document;
      scope2.querySelectorAll('details.accordion').forEach(function (d) { d.open = false; });
    }
  });

  /* ------------------------------------------------------------------------
     6. ПОИСК ПО КАРТЕ САЙТА
     ------------------------------------------------------------------------ */
  var siteSearch = document.getElementById('sitemapSearch');
  if (siteSearch) {
    var siteStatus = document.getElementById('sitemapStatus');
    var clearSite = document.getElementById('sitemapClear');
    function filterSitemap() {
      var q = siteSearch.value.trim().toLowerCase();
      var items = document.querySelectorAll('.sitemap-card li');
      var found = 0;
      items.forEach(function (li) {
        var ok = !q || (li.textContent || '').toLowerCase().indexOf(q) !== -1;
        li.style.display = ok ? '' : 'none';
        if (ok) found++;
      });
      document.querySelectorAll('.sitemap-card').forEach(function (card) {
        var visible = Array.from(card.querySelectorAll('li')).some(function (li) { return li.style.display !== 'none'; });
        card.style.display = visible ? '' : 'none';
      });
      if (siteStatus) {
        siteStatus.textContent = q
          ? (found ? 'Найдено разделов: ' + found : 'Ничего не найдено по запросу «' + siteSearch.value.trim() + '».')
          : 'Введите слово (например: «талон», «рентген», «льготы», «Нёманская», «вакансии»).';
      }
    }
    siteSearch.addEventListener('input', filterSitemap);
    if (clearSite) clearSite.addEventListener('click', function () { siteSearch.value = ''; filterSitemap(); siteSearch.focus(); });
    filterSitemap();
  }

  /* ------------------------------------------------------------------------
     7. ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА ИНТЕРФЕЙСА (РУС / БЕЛ / ENG)
     ------------------------------------------------------------------------ */
  var I18N = {
    ru: {
      top_hours: 'Пн–Пт: регистратура 7:30–21:00, врачи 8:00–21:00 · Сб: 9:00–15:00 · Вс: выходной',
      a11y_btn: 'Версия для слабовидящих',
      eyebrow: 'Учреждение здравоохранения · г. Минск',
      brand_title: '7-я городская стоматологическая поликлиника',
      cta_talon: 'Заказать талон онлайн',
      cta_phones: 'Телефоны',
      nav_home: 'Главная',
      nav_talon: 'Как получить талон',
      nav_schedule: 'Расписание',
      nav_services: 'Услуги',
      nav_paid: 'Платные услуги',
      nav_filial: 'Филиал №1',
      nav_district: 'Район обслуживания',
      nav_contacts: 'Контакты',
      nav_more: 'Ещё разделы ▾'
    },
    be: {
      top_hours: 'Пн–Пт: рэгістратура 7:30–21:00, урачы 8:00–21:00 · Сб: 9:00–15:00 · Нд: выхадны',
      a11y_btn: 'Версія для слабавідушчых',
      eyebrow: 'Установа аховы здароўя · г. Мінск',
      brand_title: '7-я гарадская стаматалагічная паліклініка',
      cta_talon: 'Замовіць талон анлайн',
      cta_phones: 'Тэлефоны',
      nav_home: 'Галоўная',
      nav_talon: 'Як атрымаць талон',
      nav_schedule: 'Расклад',
      nav_services: 'Паслугі',
      nav_paid: 'Платныя паслугі',
      nav_filial: 'Філіял №1',
      nav_district: 'Раён абслугоўвання',
      nav_contacts: 'Кантакты',
      nav_more: 'Яшчэ раздзелы ▾'
    },
    en: {
      top_hours: 'Mon–Fri: Desk 7:30–21:00, Doctors 8:00–21:00 · Sat: 9:00–15:00 · Sun: Closed',
      a11y_btn: 'Visually Impaired Mode',
      eyebrow: 'Healthcare Institution · Minsk, Belarus',
      brand_title: '7th Municipal Dental Polyclinic',
      cta_talon: 'Book Appointment Online',
      cta_phones: 'Phones',
      nav_home: 'Home',
      nav_talon: 'Appointments',
      nav_schedule: 'Schedule',
      nav_services: 'Services',
      nav_paid: 'Paid Care & Prices',
      nav_filial: 'Branch #1',
      nav_district: 'Service Area',
      nav_contacts: 'Contacts',
      nav_more: 'More Sections ▾'
    }
  };

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.ru;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (dict[k]) el.textContent = dict[k];
    });
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  var savedLang = 'ru';
  try { savedLang = localStorage.getItem(LANG_KEY) || 'ru'; } catch (e) {}
  applyLang(savedLang);

  document.addEventListener('click', function (e) {
    var lb = e.target.closest('[data-lang]');
    if (lb) applyLang(lb.getAttribute('data-lang'));
  });
})();
