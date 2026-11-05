/* Chimpi support notice — no downloads, telemetry or forced navigation */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChimpiSupport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const POLICY = {"schema": 1, "verified_at": "2026-11-02", "ends_at": "2026-11-04T00:00:00Z", "table": "https://chimpi-hackintosh.github.io/ChimpiBlender-Online/support.html", "apps": {"OpenCore-Helper": {"name": "OpenCore Helper", "repo": "OpenCore-Helper", "minimum": "3.0.2", "tag": "v3.0.2", "preview": false, "edition": null, "url": "https://github.com/Chimpi-hackintosh/OpenCore-Helper/releases/tag/v3.0.2", "status": "published"}, "SnoopyOS-Lite": {"name": "SnoopyOS Lite", "repo": "SnoopyOS-Image", "minimum": "0.1.3", "tag": "v0.1-lite.3", "preview": true, "edition": "lite", "url": "https://github.com/Chimpi-hackintosh/SnoopyOS-Image/releases/tag/v0.1-lite.3", "status": "preview"}, "SnoopyOS-Games": {"name": "SnoopyOS Games", "repo": "SnoopyOS-Image", "minimum": "0.2.1", "tag": "v0.2-games.1", "preview": true, "edition": "games", "url": "https://github.com/Chimpi-hackintosh/SnoopyOS-Image/releases/tag/v0.2-games.1", "status": "preview"}, "ChimpiAI": {"name": "ChimpiAI", "repo": "ChimpiAI", "minimum": "1.0.0", "tag": "ChimpiAI-1.0.0-beta", "preview": true, "edition": null, "url": "https://github.com/Chimpi-hackintosh/ChimpiAI/releases/tag/ChimpiAI-1.0.0-beta", "status": "preview"}, "WinSIMU": {"name": "WinSIMU", "repo": "WinSIMU", "minimum": "0.1.0", "tag": "v0.1.0-alpha", "preview": true, "edition": null, "url": "https://github.com/Chimpi-hackintosh/WinSIMU/releases/tag/v0.1.0-alpha", "status": "preview"}, "ChimpiCode": {"name": "ChimpiCode", "repo": "ChimpiCode", "minimum": "1.1.0", "tag": "v1.1.0-preview.3", "preview": true, "edition": null, "url": "https://github.com/Chimpi-hackintosh/ChimpiCode/releases/tag/v1.1.0-preview.3", "status": "preview"}, "ChimpiBridge": {"name": "ChimpiBridge", "repo": "ChimpiBridge", "minimum": "0.1.1", "tag": "v0.1.1", "preview": true, "edition": null, "url": "https://github.com/Chimpi-hackintosh/ChimpiBridge/releases/tag/v0.1.1", "status": "preview"}, "ChimpiShare": {"name": "ChimpiShare", "repo": "ChimpiShare", "minimum": "0.1.0", "tag": "v0.1.0", "preview": true, "edition": null, "url": "https://github.com/Chimpi-hackintosh/ChimpiShare/releases/tag/v0.1.0", "status": "preview"}, "ChimpiConstrucoes": {"name": "ChimpiConstruções", "repo": "ChimpiConstrucoes", "minimum": null, "tag": null, "preview": true, "edition": null, "url": "https://github.com/Chimpi-hackintosh/ChimpiConstrucoes", "status": "source"}, "ChimpiBlender-Online": {"name": "ChimpiBlender Online", "repo": "ChimpiBlender-Online", "minimum": null, "tag": null, "preview": false, "edition": null, "url": "https://chimpi-hackintosh.github.io/ChimpiBlender-Online/", "status": "website", "web_revision": 20261102}, "ChimpiNotch": {"name": "ChimpiNotch", "repo": "ChimpiNotch", "minimum": "1.0.4", "tag": "v1.0.4", "preview": false, "edition": null, "url": "https://github.com/Chimpi-hackintosh/ChimpiNotch/releases/tag/v1.0.4", "status": "published"}, "Chimpi3D-Installer": {"name": "Chimpi3D", "repo": "Chimpi3D-Installer", "minimum": "0.3.1", "tag": "v0.3.1-build-11", "preview": false, "edition": null, "url": "https://github.com/Chimpi-hackintosh/Chimpi3D-Installer/releases/tag/v0.3.1-build-11", "status": "published"}, "ChimpiNFC": {"name": "ChimpiNFC", "repo": "ChimpiNFC", "minimum": "0.1.0", "tag": "v0.1.0-build-2", "preview": true, "edition": null, "url": "https://github.com/Chimpi-hackintosh/ChimpiNFC/releases/tag/v0.1.0-build-2", "status": "preview"}}};
  const MESSAGES = {"en": {"before": "Your version is about to lose support", "after": "Your version no longer receives security updates", "body_before": "Older versions of {app} will stop receiving security updates on 4 November 2026", "body_after": "Older versions of {app} have not received security updates since 4 November 2026", "risk": "Software without security fixes may remain exposed to vulnerabilities — update from the official project page", "versions": "Installed: {current} · Minimum supported: {minimum} · Available: {latest}", "update": "Update", "later": "Later", "table": "Apps and support", "app": "App / website", "available": "Available version", "support": "Support / action", "published": "Published", "preview": "Preview — may be unstable", "source": "No downloadable release — no upgrade required yet", "website": "Website — reload for the latest code", "intro": "Versions below those listed lose security support on 4 November 2026 — the date is 00:00 UTC", "intro_after": "Versions below those listed no longer receive security updates as of 4 November 2026 at 00:00 UTC", "legacy": "Already installed versions without an update checker need a manual update — this notice does not imply an infection or install anything automatically", "footer": "Catalog verified on {date} — release links are official, source changes awaiting review are not new releases"}, "pt": {"before": "Sua versão está prestes a não ser suportada", "after": "Sua versão não recebe mais atualizações de segurança", "body_before": "As versões antigas do {app} deixarão de receber atualizações de segurança em 4 de novembro de 2026", "body_after": "As versões antigas do {app} não recebem atualizações de segurança desde 4 de novembro de 2026", "risk": "Software sem correções de segurança pode ficar exposto a falhas — atualize pela página oficial do projeto", "versions": "Instalada: {current} · Mínima suportada: {minimum} · Disponível: {latest}", "update": "Atualizar", "later": "Depois", "table": "Apps e suporte", "app": "App / site", "available": "Versão disponível", "support": "Suporte / ação", "published": "Publicada", "preview": "Prévia — pode ter instabilidade", "source": "Sem lançamento para download — ainda sem atualização exigida", "website": "Site — recarregue para receber o código atual", "intro": "Versões abaixo das listadas perdem o suporte de segurança em 4 de novembro de 2026, às 00h UTC", "intro_after": "Versões abaixo das listadas não recebem atualizações de segurança desde 4 de novembro de 2026, às 00h UTC", "legacy": "Versões já instaladas sem verificador precisam de atualização manual — este aviso não indica infecção nem instala nada automaticamente", "footer": "Catálogo conferido em {date} — os links são oficiais e alterações aguardando revisão ainda não são novos lançamentos"}, "es": {"before": "Tu versión está a punto de perder soporte", "after": "Tu versión ya no recibe actualizaciones de seguridad", "body_before": "Las versiones antiguas de {app} dejarán de recibir actualizaciones de seguridad el 4 de noviembre de 2026", "body_after": "Las versiones antiguas de {app} no reciben actualizaciones de seguridad desde el 4 de noviembre de 2026", "risk": "El software sin correcciones de seguridad puede quedar expuesto a vulnerabilidades — actualiza desde la página oficial", "versions": "Instalada: {current} · Mínima compatible: {minimum} · Disponible: {latest}", "update": "Actualizar", "later": "Más tarde", "table": "Apps y soporte"}, "fr": {"before": "Votre version va bientôt perdre son support", "after": "Votre version ne reçoit plus de mises à jour de sécurité", "body_before": "Les anciennes versions de {app} ne recevront plus de mises à jour de sécurité à partir du 4 novembre 2026", "body_after": "Les anciennes versions de {app} ne reçoivent plus de mises à jour de sécurité depuis le 4 novembre 2026", "risk": "Un logiciel sans correctifs de sécurité peut rester vulnérable — mettez-le à jour depuis la page officielle", "versions": "Installée : {current} · Minimum pris en charge : {minimum} · Disponible : {latest}", "update": "Mettre à jour", "later": "Plus tard", "table": "Apps et support"}, "de": {"before": "Deine Version wird bald nicht mehr unterstützt", "after": "Deine Version erhält keine Sicherheitsupdates mehr", "body_before": "Ältere Versionen von {app} erhalten ab dem 4. November 2026 keine Sicherheitsupdates mehr", "body_after": "Ältere Versionen von {app} erhalten seit dem 4. November 2026 keine Sicherheitsupdates mehr", "risk": "Software ohne Sicherheitskorrekturen kann angreifbar bleiben — aktualisiere sie über die offizielle Projektseite", "versions": "Installiert: {current} · Unterstütztes Minimum: {minimum} · Verfügbar: {latest}", "update": "Aktualisieren", "later": "Später", "table": "Apps und Support"}, "it": {"before": "La tua versione sta per perdere il supporto", "after": "La tua versione non riceve più aggiornamenti di sicurezza", "body_before": "Le versioni precedenti di {app} non riceveranno più aggiornamenti di sicurezza dal 4 novembre 2026", "body_after": "Le versioni precedenti di {app} non ricevono aggiornamenti di sicurezza dal 4 novembre 2026", "risk": "Il software senza correzioni di sicurezza può restare vulnerabile — aggiorna dalla pagina ufficiale", "versions": "Installata: {current} · Minima supportata: {minimum} · Disponibile: {latest}", "update": "Aggiorna", "later": "Più tardi", "table": "App e supporto"}, "ru": {"before": "Поддержка вашей версии скоро закончится", "after": "Ваша версия больше не получает обновления безопасности", "body_before": "Старые версии {app} перестанут получать обновления безопасности 4 ноября 2026 года", "body_after": "Старые версии {app} не получают обновления безопасности с 4 ноября 2026 года", "risk": "Программы без исправлений безопасности могут оставаться уязвимыми — обновитесь с официальной страницы проекта", "versions": "Установлена: {current} · Минимальная поддерживаемая: {minimum} · Доступна: {latest}", "update": "Обновить", "later": "Позже", "table": "Приложения и поддержка"}, "zh": {"before": "你的版本即将停止支持", "after": "你的版本已停止接收安全更新", "body_before": "{app} 的旧版本将于 2026 年 11 月 4 日停止接收安全更新", "body_after": "{app} 的旧版本自 2026 年 11 月 4 日起不再接收安全更新", "risk": "缺少安全修复的软件可能仍存在漏洞，请通过项目官方页面更新", "versions": "已安装：{current} · 最低支持版本：{minimum} · 可用版本：{latest}", "update": "更新", "later": "稍后", "table": "应用与支持"}, "ja": {"before": "このバージョンのサポートはまもなく終了します", "after": "このバージョンのセキュリティ更新は終了しました", "body_before": "{app} の旧バージョンは2026年11月4日にセキュリティ更新を終了します", "body_after": "{app} の旧バージョンは2026年11月4日以降セキュリティ更新を受け取れません", "risk": "修正のないソフトウェアには脆弱性が残る可能性があります — 公式ページから更新してください", "versions": "インストール済み：{current} · 最低サポート：{minimum} · 利用可能：{latest}", "update": "更新", "later": "後で", "table": "アプリとサポート"}, "ko": {"before": "현재 버전의 지원이 곧 종료됩니다", "after": "현재 버전은 더 이상 보안 업데이트를 받지 않습니다", "body_before": "{app}의 이전 버전은 2026년 11월 4일부터 보안 업데이트를 받지 않습니다", "body_after": "{app}의 이전 버전은 2026년 11월 4일 이후 보안 업데이트가 중단되었습니다", "risk": "보안 수정이 없는 소프트웨어는 취약할 수 있습니다 — 공식 프로젝트 페이지에서 업데이트하세요", "versions": "설치됨: {current} · 최소 지원: {minimum} · 사용 가능: {latest}", "update": "업데이트", "later": "나중에", "table": "앱 및 지원"}, "ar": {"before": "سيتوقف دعم إصدارك قريبًا", "after": "لم يعد إصدارك يتلقى تحديثات الأمان", "body_before": "ستتوقف الإصدارات القديمة من {app} عن تلقي تحديثات الأمان في 4 نوفمبر 2026", "body_after": "لم تعد الإصدارات القديمة من {app} تتلقى تحديثات الأمان منذ 4 نوفمبر 2026", "risk": "قد تظل البرامج دون إصلاحات أمنية عرضة للثغرات — حدّث من صفحة المشروع الرسمية", "versions": "المثبت: {current} · الحد الأدنى المدعوم: {minimum} · المتاح: {latest}", "update": "تحديث", "later": "لاحقًا", "table": "التطبيقات والدعم"}, "hi": {"before": "आपके संस्करण का समर्थन जल्द समाप्त होगा", "after": "आपके संस्करण को अब सुरक्षा अपडेट नहीं मिलते", "body_before": "{app} के पुराने संस्करणों को 4 नवंबर 2026 से सुरक्षा अपडेट नहीं मिलेंगे", "body_after": "{app} के पुराने संस्करणों को 4 नवंबर 2026 से सुरक्षा अपडेट नहीं मिल रहे हैं", "risk": "सुरक्षा सुधारों के बिना सॉफ़्टवेयर असुरक्षित रह सकता है — आधिकारिक परियोजना पेज से अपडेट करें", "versions": "इंस्टॉल किया गया: {current} · न्यूनतम समर्थित: {minimum} · उपलब्ध: {latest}", "update": "अपडेट करें", "later": "बाद में", "table": "ऐप और समर्थन"}};
  const POLICY_URL = 'https://raw.githubusercontent.com/Chimpi-hackintosh/ChimpiBlender-Online/main/support-policy.json';
  const language = tag => {
    const code = String(tag || 'en').replace('_', '-').split('-')[0].toLowerCase();
    return MESSAGES[code] ? code : 'en';
  };
  const texts = tag => Object.assign({}, MESSAGES.en, MESSAGES[language(tag)]);
  const version = value => {
    if (typeof value !== 'string' || value.length > 100) return null;
    const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+][A-Za-z0-9.-]+)?$/.exec(value);
    return match ? match.slice(1, 4).map(Number) : null;
  };
  const compare = (left, right) => {
    for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
    return 0;
  };
  const official = (url, repo) => {
    try {
      const u = new URL(url), parts = u.pathname.split('/').filter(Boolean);
      return u.protocol === 'https:' && !u.username && !u.password && !u.search && !u.hash && !u.port && u.hostname === 'github.com' && parts[0] === 'Chimpi-hackintosh' && parts[1] === repo;
    } catch (_) { return false; }
  };
  const officialWebsite = (url, repo) => {
    try { const u = new URL(url); return u.protocol === 'https:' && !u.username && !u.password && !u.search && !u.hash && !u.port && u.hostname === 'chimpi-hackintosh.github.io' && u.pathname === '/' + repo + '/'; }
    catch (_) { return false; }
  };
  function checkedPolicy(candidate) {
    const result = JSON.parse(JSON.stringify(POLICY));
    if (!candidate || candidate.schema !== 1 || !candidate.apps) return result;
    Object.keys(POLICY.apps).forEach(key => {
      const old = POLICY.apps[key], entry = candidate.apps[key];
      if (old.status === 'website') {
        if (entry && entry.repo === old.repo && Number.isSafeInteger(entry.web_revision) && entry.web_revision >= old.web_revision && officialWebsite(entry.url, old.repo))
          result.apps[key] = Object.assign({}, old, {web_revision: entry.web_revision, url: entry.url});
        return;
      }
      if (!entry || entry.repo !== old.repo || !version(entry.minimum) || !official(entry.url, old.repo)) return;
      if (version(old.minimum) && compare(version(entry.minimum), version(old.minimum)) < 0) return;
      result.apps[key] = Object.assign({}, old, {minimum: entry.minimum, tag: String(entry.tag || entry.minimum).slice(0, 100), url: entry.url});
    });
    return result;
  }
  const format = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));
  function notice(app, current, policy = POLICY, now = new Date(), tag = 'en') {
    const entry = policy.apps[app];
    if (!entry) return null;
    if (entry.status === 'website') {
      const installed = Number(current);
      if (!Number.isSafeInteger(installed) || !Number.isSafeInteger(entry.web_revision) || installed >= entry.web_revision || !officialWebsite(entry.url, entry.repo)) return null;
    } else {
      const installed = version(current), minimum = version(entry.minimum);
      if (!installed || !minimum || compare(installed, minimum) >= 0 || !official(entry.url, entry.repo)) return null;
    }
    const tr = texts(tag), phase = now >= new Date(POLICY.ends_at) ? 'after' : 'before';
    const vars = {app: entry.name, current, minimum: entry.web_revision || entry.minimum, latest: entry.tag || entry.web_revision || entry.minimum};
    return {title: tr[phase], body: [format(tr['body_' + phase], vars), tr.risk, format(tr.versions, vars)].join('\n\n'), phase, url: entry.url, texts: tr, table: POLICY.table};
  }
  async function fetchPolicy() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(POLICY_URL, {signal: controller.signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer'});
      if (!response.ok) throw new Error('Policy unavailable');
      const raw = await response.text();
      if (raw.length > 262144) throw new Error('Oversized policy');
      return checkedPolicy(JSON.parse(raw));
    } catch (_) { return POLICY; }
    finally { clearTimeout(timer); }
  }
  function show(item) {
    if (!item || document.getElementById('chimpi-support-notice')) return;
    // Modeless notice preserves editing, file selection and assistive navigation.
    const box = document.createElement('aside');
    box.id = 'chimpi-support-notice';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-labelledby', 'chimpi-support-title');
    box.style.cssText = 'position:fixed;z-index:10000;bottom:16px;right:16px;max-width:min(480px,calc(100vw - 48px));max-height:80vh;overflow:auto;padding:20px;background:#172334;color:#f4f7fc;border:2px solid #e7ad46;border-radius:12px;box-shadow:0 8px 30px #0008;font:16px/1.5 system-ui';
    box.dir = language(navigator.language) === 'ar' ? 'rtl' : 'auto';
    const title = document.createElement('h2');
    title.id = 'chimpi-support-title'; title.textContent = item.title;
    title.style.cssText = 'font:700 20px/1.3 system-ui;margin:0 0 12px';
    const body = document.createElement('p'); body.textContent = item.body; body.style.whiteSpace = 'pre-line';
    box.append(title, body);
    [[item.texts.update, item.url], [item.texts.table, item.table]].forEach(([label, url]) => {
      const link = document.createElement('a'); link.textContent = label; link.href = url;
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.style.cssText = 'display:inline-block;color:#b8dcff;margin:4px 12px 4px 0;text-decoration:underline';
      box.append(link);
    });
    const close = document.createElement('button'); close.type = 'button'; close.textContent = item.texts.later;
    close.style.cssText = 'padding:8px 12px;border:1px solid #abc;border-radius:6px;background:#24384f;color:white;cursor:pointer';
    close.addEventListener('click', () => box.remove()); box.append(close);
    document.body.append(box);
  }
  async function attach(app, current) {
    const policy = await fetchPolicy();
    show(notice(app, current, policy, new Date(), navigator.language));
  }
  function renderTable(container) {
    const tr = texts(navigator.language);
    document.documentElement.lang = language(navigator.language);
    document.documentElement.dir = language(navigator.language) === 'ar' ? 'rtl' : 'ltr';
    document.title = tr.table;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = tr[node.dataset.i18n] || ''; });
    document.querySelector('[data-i18n="intro"]').textContent = new Date() >= new Date(POLICY.ends_at) ? tr.intro_after : tr.intro;
    document.getElementById('catalog-footer').textContent = format(tr.footer, {date: POLICY.verified_at});
    container.replaceChildren();
    for (const entry of Object.values(POLICY.apps)) {
      const row = document.createElement('tr');
      const app = document.createElement('th'); app.scope = 'row'; app.textContent = entry.name;
      const available = document.createElement('td'), link = document.createElement('a');
      link.href = entry.url; link.textContent = entry.tag || (entry.status === 'website' ? tr.website : '—');
      link.rel = 'noopener noreferrer'; link.target = '_blank'; available.append(link);
      const status = document.createElement('td'); status.textContent = tr[entry.status] || entry.status;
      row.append(app, available, status); container.append(row);
    }
  }
  return {POLICY, MESSAGES, language, texts, version, compare, official, checkedPolicy, notice, fetchPolicy, show, attach, renderTable};
});
