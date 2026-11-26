"use strict";

(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const EMAIL = "all4nfr4g4@gmail.com";
  const LINKEDIN = "https://www.linkedin.com/in/alan-fraga-46285b385/";
  const GITHUB = "https://github.com/all4nfr4g4";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const isMac = /Mac|iPhone|iPad|iPod/i.test(
    (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent,
  );

  const scrollBehavior = () => (reducedMotion.matches ? "auto" : "smooth");

  function createEl(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function showToast(message) {
    const container = $("#toast-container");
    if (!container) return;
    while (container.children.length >= 2) container.firstElementChild.remove();
    const toast = createEl("div", "toast", message);
    container.append(toast);
    window.setTimeout(() => {
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      /* fallback abaixo */
    }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      return copied;
    } catch (error) {
      return false;
    }
  }

  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    dialog.showModal();
    document.body.classList.add("dialog-open");
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }

  function goTo(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }

  function openCase(id) {
    const dialog = document.getElementById(id);
    if (dialog) openDialog(dialog);
  }

  /* ---------- header, progress and menu ---------- */

  function initHeader() {
    const header = $("#site-header");
    const progress = $("#scroll-progress");
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = `${max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0}%`;
      if (header) header.classList.toggle("is-scrolled", scrollTop > 8);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  function initMenu() {
    const button = $(".menu-toggle");
    const nav = $("#nav-links");
    if (!button || !nav) return;

    const setMenu = (open) => {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };

    button.addEventListener("click", () => {
      setMenu(button.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        button.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (event.target.closest(".site-header")) return;
      setMenu(false);
    });

    document.addEventListener("close-menu", () => setMenu(false));

    const desktop = window.matchMedia("(min-width: 981px)");
    desktop.addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });
  }

  function initScrollSpy() {
    const ids = ["inicio", "sobre", "atuacao", "laboratorio", "projetos", "experiencia", "contato"];
    const navMap = new Map();
    const railMap = new Map();

    $$(".nav-links a[data-nav]").forEach((link) => navMap.set(link.dataset.nav, link));
    $$(".section-rail a[data-rail]").forEach((link) => railMap.set(link.dataset.rail, link));

    let active = "";

    const setActive = (id) => {
      if (!id || id === active) return;
      active = id;
      navMap.forEach((link, key) => {
        const on = key === id;
        link.classList.toggle("is-active", on);
        if (on) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      railMap.forEach((link, key) => {
        const on = key === id;
        link.classList.toggle("is-active", on);
        if (on) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
      );
      ids.forEach((id) => {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
      });
    }

    window.addEventListener(
      "scroll",
      () => {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
          setActive("contato");
        }
      },
      { passive: true },
    );

    setActive("inicio");
  }

  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || reducedMotion.matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -7% 0px" },
    );

    items.forEach((item) => observer.observe(item));
  }

  function initClock() {
    const year = $("#current-year");
    if (year) year.textContent = String(new Date().getFullYear());

    const time = $("#local-time");
    if (!time) return;

    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Bahia",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const tick = () => {
      time.textContent = formatter.format(new Date());
    };

    tick();
    window.setInterval(tick, 30000);
  }

  function initBackToTop() {
    const button = $("#back-to-top");
    if (!button) return;
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
    });
  }

  /* ---------- hero ---------- */

  function initHero() {
    const hero = $(".hero");
    const visual = $("#hero-visual");
    const consoleEl = $(".console");

    if (hero && finePointer.matches && !reducedMotion.matches) {
      let frame = 0;
      let mx = 68;
      let my = 34;

      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        mx = ((event.clientX - rect.left) / rect.width) * 100;
        my = ((event.clientY - rect.top) / rect.height) * 100;
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          hero.style.setProperty("--mx", `${mx}%`);
          hero.style.setProperty("--my", `${my}%`);
          frame = 0;
        });
      });
    }

    if (visual && consoleEl && finePointer.matches && !reducedMotion.matches) {
      let frame = 0;
      let rx = 0;
      let ry = 0;

      const apply = () => {
        consoleEl.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        consoleEl.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
        frame = 0;
      };

      visual.addEventListener("pointermove", (event) => {
        const rect = visual.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rx = py * -6;
        ry = px * 7;
        if (!frame) frame = window.requestAnimationFrame(apply);
      });

      visual.addEventListener("pointerleave", () => {
        rx = 0;
        ry = 0;
        if (!frame) frame = window.requestAnimationFrame(apply);
      });
    }

    initConsoleFeed();
  }

  function initConsoleFeed() {
    const feed = $("#console-feed");
    const eventsEl = $("#stat-events");
    const alertsEl = $("#stat-alerts");
    const visual = $("#hero-visual");
    if (!feed || !eventsEl || !alertsEl || reducedMotion.matches) return;

    const messages = [
      { sev: "info", text: "conexão SSH estabelecida · 10.0.0.12" },
      { sev: "warn", text: "tentativa de login falhou · 203.0.113.44" },
      { sev: "info", text: "log de firewall sincronizado" },
      { sev: "ok", text: "evento classificado como baixo risco" },
      { sev: "info", text: "consulta DNS resolvida em 12 ms" },
      { sev: "warn", text: "taxa de erros acima do baseline" },
      { sev: "ok", text: "triagem concluída · 04 fontes" },
      { sev: "crit", text: "bloqueio automático aplicado · fail2ban" },
      { sev: "info", text: "heartbeat do agente recebido" },
      { sev: "ok", text: "regra validada sem novos alertas" },
    ];

    let visible = true;
    if ("IntersectionObserver" in window && visual) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      }, { threshold: 0.08 }).observe(visual);
    }

    let events = 1284;
    let alerts = 7;
    let index = 0;

    window.setInterval(() => {
      if (!visible || document.hidden || reducedMotion.matches) return;

      const item = messages[index % messages.length];
      index += 1;

      const row = createEl("div", `feed-row sev-${item.sev}`);
      const time = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      row.append(createEl("span", "feed-time", time), document.createElement("i"), createEl("span", "feed-msg", item.text));
      feed.prepend(row);
      while (feed.children.length > 4) feed.lastElementChild.remove();

      events += 1 + Math.floor(Math.random() * 4);
      eventsEl.textContent = events.toLocaleString("pt-BR");

      if (item.sev === "warn" || item.sev === "crit") {
        alerts = Math.min(99, alerts + 1);
        alertsEl.textContent = String(alerts).padStart(2, "0");
      }
    }, 3600);
  }

  /* ---------- toolkit filter ---------- */

  function initToolkit() {
    const buttons = $$(".filter");
    const tools = $$("#tool-grid .tool");
    if (!buttons.length || !tools.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        buttons.forEach((item) => {
          const on = item === button;
          item.classList.toggle("is-active", on);
          item.setAttribute("aria-pressed", String(on));
        });
        tools.forEach((tool) => {
          tool.classList.toggle("is-hidden", filter !== "all" && tool.dataset.cat !== filter);
        });
      });
    });
  }

  /* ---------- command palette ---------- */

  const COMMANDS = [
    {
      group: "Navegação",
      label: "Início",
      hint: "01",
      icon: "⌂",
      keywords: "home topo inicio hero",
      run: () => goTo("inicio"),
    },
    {
      group: "Navegação",
      label: "Sobre mim",
      hint: "02",
      icon: "◈",
      keywords: "perfil bio sobre historia",
      run: () => goTo("sobre"),
    },
    {
      group: "Navegação",
      label: "Atuação e ferramentas",
      hint: "03",
      icon: "◇",
      keywords: "skills atuacao ferramentas stack",
      run: () => goTo("atuacao"),
    },
    {
      group: "Navegação",
      label: "Laboratório de logs",
      hint: "04",
      icon: "⌘",
      keywords: "lab laboratorio logs soc triagem demo",
      run: () => goTo("laboratorio"),
    },
    {
      group: "Navegação",
      label: "Projetos",
      hint: "05",
      icon: "▤",
      keywords: "projetos portfolio estudos",
      run: () => goTo("projetos"),
    },
    {
      group: "Navegação",
      label: "Trajetória",
      hint: "06",
      icon: "↳",
      keywords: "experiencia carreira timeline formacao",
      run: () => goTo("experiencia"),
    },
    {
      group: "Navegação",
      label: "Contato",
      hint: "07",
      icon: "@",
      keywords: "contato email fale comigo",
      run: () => goTo("contato"),
    },
    {
      group: "Projetos",
      label: "SOC & análise de logs",
      hint: "Estudo 01",
      icon: "01",
      keywords: "soc logs python pandas regex defesa",
      run: () => openCase("case-soc"),
    },
    {
      group: "Projetos",
      label: "Superfície & hardening",
      hint: "Estudo 02",
      icon: "02",
      keywords: "hardening linux ssh ufw nmap seguranca",
      run: () => openCase("case-hardening"),
    },
    {
      group: "Projetos",
      label: "Rotinas & backup",
      hint: "Estudo 03",
      icon: "03",
      keywords: "automacao backup systemd bash rclone",
      run: () => openCase("case-automation"),
    },
    {
      group: "Ações",
      label: "Copiar e-mail",
      hint: EMAIL,
      icon: "@",
      keywords: "copiar email contato clipboard",
      run: async () => {
        const copied = await copyText(EMAIL);
        showToast(copied ? "E-mail copiado para a área de transferência" : "Não foi possível copiar o e-mail");
      },
    },
    {
      group: "Links",
      label: "LinkedIn",
      hint: "Abrir ↗",
      icon: "in",
      keywords: "linkedin rede social perfil",
      run: () => window.open(LINKEDIN, "_blank", "noopener"),
    },
    {
      group: "Links",
      label: "GitHub",
      hint: "Abrir ↗",
      icon: "GH",
      keywords: "github codigo repositorio",
      run: () => window.open(GITHUB, "_blank", "noopener"),
    },
  ];

  function initPalette() {
    const dialog = $("#palette");
    const input = $("#palette-input");
    const list = $("#palette-list");
    if (!dialog || !input || !list) return;

    let items = [];
    let activeIndex = -1;
    let lastTrigger = null;

    const normalize = (value) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const filtered = (query) => {
      const term = normalize(query.trim());
      if (!term) return COMMANDS;
      return COMMANDS.filter((command) =>
        normalize(`${command.label} ${command.hint} ${command.keywords} ${command.group}`).includes(term),
      );
    };

    const setActive = (index) => {
      if (!items.length) return;
      activeIndex = (index + items.length) % items.length;
      items.forEach((item, itemIndex) => {
        const on = itemIndex === activeIndex;
        item.classList.toggle("is-active", on);
        item.setAttribute("aria-selected", String(on));
      });
      const active = items[activeIndex];
      input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView({ block: "nearest" });
    };

    const execute = (command) => {
      closeDialog(dialog);
      window.setTimeout(() => command.run(), 80);
    };

    const render = (query) => {
      const results = filtered(query);
      list.textContent = "";
      items = [];
      activeIndex = -1;

      if (!results.length) {
        list.append(createEl("div", "palette-empty", "Nenhum resultado. Tente “projetos”, “logs” ou “e-mail”."));
        input.removeAttribute("aria-activedescendant");
        return;
      }

      let currentGroup = "";
      results.forEach((command, index) => {
        if (command.group !== currentGroup) {
          currentGroup = command.group;
          list.append(createEl("div", "palette-group-label", command.group));
        }

        const item = document.createElement("button");
        item.type = "button";
        item.className = "palette-item";
        item.id = `palette-item-${index}`;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        item.append(
          createEl("span", "palette-item-icon", command.icon),
          createEl("span", "palette-item-label", command.label),
          createEl("span", "palette-item-hint", command.hint),
        );

        item.addEventListener("mouseenter", () => setActive(items.indexOf(item)));
        item.addEventListener("click", () => execute(command));

        list.append(item);
        items.push(item);
      });

      setActive(0);
    };

    const open = (trigger) => {
      lastTrigger = trigger || document.activeElement;
      document.dispatchEvent(new CustomEvent("close-menu"));
      if (!dialog.open) dialog.showModal();
      document.body.classList.add("dialog-open");
      input.value = "";
      render("");
      window.requestAnimationFrame(() => input.focus());
    };

    $$("[data-open-palette]").forEach((trigger) => {
      trigger.addEventListener("click", () => open(trigger));
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.open) closeDialog(dialog);
        else open(document.activeElement);
        return;
      }

      if (event.key === "/" && !typing && !dialog.open) {
        event.preventDefault();
        open(document.activeElement);
      }
    });

    input.addEventListener("input", () => render(input.value));

    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex - 1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const command = filtered(input.value)[activeIndex];
        if (command) execute(command);
      }
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });

    dialog.addEventListener("close", () => {
      input.value = "";
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    });
  }

  /* ---------- dialogs ---------- */

  function initDialogs() {
    const dialogs = $$("dialog");
    if (!dialogs.length) return;

    const syncLock = () => {
      document.body.classList.toggle("dialog-open", dialogs.some((dialog) => dialog.open));
    };

    dialogs.forEach((dialog) => {
      dialog.addEventListener("close", syncLock);
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

    $$("[data-dialog]").forEach((button) => {
      button.addEventListener("click", () => openCase(button.dataset.dialog));
    });

    $$("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => {
        const dialog = button.closest("dialog");
        if (dialog) closeDialog(dialog);
      });
    });
  }

  /* ---------- log analyzer ---------- */

  const SAMPLE_LOGS = [
    "2026-11-24T09:12:04Z sshd[2211]: Failed password for invalid user admin from 203.0.113.44 port 55221 ssh2",
    "2026-11-24T09:12:19Z sshd[2212]: Failed password for invalid user admin from 203.0.113.44 port 55222 ssh2",
    "2026-11-24T09:12:33Z sshd[2213]: Failed password for invalid user root from 203.0.113.44 port 55223 ssh2",
    "2026-11-24T09:13:02Z sshd[2214]: Accepted password for alan from 203.0.113.44 port 55230 ssh2",
    "2026-11-24T09:13:41Z sudo: alan : 3 incorrect password attempts ; TTY=pts/0 ; PWD=/home/alan ; USER=root ; COMMAND=/usr/bin/apt update",
    "2026-11-24T09:15:20Z nginx: 198.51.100.23 - - \"GET /index.php?id=1' OR '1'='1 HTTP/1.1\" 200 512",
    "2026-11-24T09:15:26Z nginx: 198.51.100.23 - - \"GET /.env HTTP/1.1\" 404 162",
    "2026-11-24T09:15:31Z nginx: 198.51.100.23 - - \"GET /wp-login.php HTTP/1.1\" 404 162",
    "2026-11-24T09:15:37Z nginx: 198.51.100.23 - - \"GET /phpmyadmin/ HTTP/1.1\" 404 162",
    "2026-11-24T09:16:03Z kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.44 DST=192.168.0.10 PROTO=TCP SPT=44321 DPT=22",
    "2026-11-24T09:17:44Z sshd[2280]: Accepted publickey for deploy from 192.168.0.20 port 60222 ssh2",
    "2026-11-24T09:18:11Z nginx: 192.0.2.77 - - \"GET /health HTTP/1.1\" 200 2",
  ].join("\n");

  const MAX_LINES = 1200;
  const MAX_CHARS = 200000;
  const SEVERITY_WEIGHT = { critical: 30, high: 18, medium: 7, low: 2 };
  const SEVERITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };
  const SEVERITY_LABEL = { critical: "Crítico", high: "Alto", medium: "Médio", low: "Baixo" };

  function groupBy(list, keyFn) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyFn(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return map;
  }

  function extractSourceIp(line) {
    const src = line.match(/\bSRC=((?:\d{1,3}\.){3}\d{1,3})/i);
    if (src) return src[1];
    const from = line.match(/\bfrom\s+((?:\d{1,3}\.){3}\d{1,3})/i);
    if (from) return from[1];
    const ips = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
    return ips ? ips[0] : "origem não identificada";
  }

  function analyzeLogs(raw) {
    const allLines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const lines = allLines.slice(0, MAX_LINES);

    const parsed = lines.map((line, index) => {
      const statusMatch = line.match(/\s(\d{3})\s\d+(?:\s|$)/);
      return {
        n: index + 1,
        line,
        lower: line.toLowerCase(),
        ips: line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [],
        status: statusMatch ? statusMatch[1] : null,
        http: /"(?:GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s/.test(line),
        source: extractSourceIp(line),
      };
    });

    const findings = [];
    const seen = new Set();

    const addFinding = (finding) => {
      if (seen.has(finding.id)) return;
      seen.add(finding.id);
      findings.push(finding);
    };

    // Brute force SSH, com possível login bem-sucedido na sequência.
    const sshFails = parsed.filter((entry) =>
      /failed password|invalid user|authentication failure/.test(entry.lower),
    );
    groupBy(sshFails, (entry) => entry.source).forEach((entries, ip) => {
      if (entries.length < 3) return;
      const first = entries[0];
      const accepted = parsed.find(
        (entry) =>
          entry.n > first.n &&
          /accepted (?:password|publickey)/.test(entry.lower) &&
          entry.source === ip,
      );
      const critical = Boolean(accepted) || entries.length >= 8;

      addFinding({
        id: `ssh-${ip}`,
        severity: critical ? "critical" : "high",
        title: accepted ? "Possível comprometimento após brute force SSH" : "Tentativas de brute force SSH",
        detail:
          `${entries.length} falhas de autenticação SSH a partir de ${ip}.` +
          (accepted
            ? " Um login bem-sucedido do mesmo IP ocorreu depois das falhas — trate como possível comprometimento da conta."
            : " O padrão é compatível com força bruta."),
        recommendation: accepted
          ? "Revogar sessões ativas, rotacionar credenciais, bloquear o IP e revisar os comandos executados na sessão aceita."
          : "Bloquear o IP temporariamente, exigir autenticação por chave e aplicar limitação de tentativas (fail2ban ou equivalente).",
        evidence: [
          ...entries.slice(0, 5).map((entry) => entry.line),
          ...(accepted ? [accepted.line] : []),
        ],
      });
    });

    // Injeção e exploração web.
    const webExploits = parsed.filter(
      (entry) =>
        entry.http &&
        /(?:'|%27)\s*(?:or|and)\s*(?:'|%27)?\d|union(?:\s|%20)+select|\.\.\/|etc\/passwd|information_schema|sleep\(|benchmark\(|<\s*script|base64_decode|cmd=|\/bin\/sh/i.test(
          entry.line,
        ),
    );

    groupBy(webExploits, (entry) => entry.source).forEach((entries, ip) => {
      const success = entries.find((entry) => entry.status && /^2\d\d$/.test(entry.status));
      addFinding({
        id: `web-${ip}`,
        severity: success ? "critical" : "high",
        title: "Tentativa de injeção / exploração web",
        detail:
          `${entries.length} requisição(ões) com padrões de ataque a partir de ${ip}.` +
          (success
            ? ` Uma delas retornou HTTP ${success.status} — verifique se a entrada foi processada pela aplicação.`
            : " Nenhuma resposta de sucesso foi identificada nas linhas analisadas."),
        recommendation:
          "Revisar a aplicação e o WAF, validar e sanitizar entradas, bloquear a origem e confirmar se houve execução ou vazamento.",
        evidence: entries.slice(0, 4).map((entry) => entry.line),
      });
    });

    // Varredura de caminhos administrativos e arquivos sensíveis.
    const sensitivePath =
      /\/\.env|\/wp-login|\/phpmyadmin|\/admin|\/\.git|\/xmlrpc\.php|\/server-status|\/config\.(?:php|json)|\.bak(?:\s|"|$)/i;
    const scans = parsed.filter((entry) => entry.http && sensitivePath.test(entry.lower));

    groupBy(scans, (entry) => entry.source).forEach((entries, ip) => {
      const paths = [
        ...new Set(
          entries.map((entry) => {
            const match = entry.line.match(/"(?:GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s+([^\s"]+)/i);
            return match ? match[1] : "caminho não extraído";
          }),
        ),
      ];

      addFinding({
        id: `scan-${ip}`,
        severity: entries.length >= 2 ? "medium" : "low",
        title: "Varredura de caminhos sensíveis",
        detail: `${entries.length} requisição(ões) para caminhos administrativos ou sensíveis a partir de ${ip}: ${paths
          .slice(0, 6)
          .join(", ")}${paths.length > 6 ? "…" : ""}.`,
        recommendation:
          "Bloquear a origem, garantir que arquivos sensíveis não estejam expostos e revisar a configuração do servidor web.",
        evidence: entries.slice(0, 4).map((entry) => entry.line),
      });
    });

    // Falhas de sudo.
    const sudoFails = parsed.filter((entry) =>
      /sudo.*(?:incorrect password|authentication failure|not in sudoers)/.test(entry.lower),
    );
    if (sudoFails.length) {
      addFinding({
        id: "sudo-fails",
        severity: sudoFails.length >= 3 ? "high" : "medium",
        title: "Falhas de elevação de privilégio",
        detail:
          `${sudoFails.length} evento(s) de falha em sudo. ` +
          (sudoFails.some((entry) => /not in sudoers/.test(entry.lower))
            ? "Há tentativa de uso de sudo por conta sem permissão."
            : "Pode indicar erro de senha ou tentativa de escalonamento."),
        recommendation:
          "Revisar contas e regras do sudoers, validar se houve acesso indevido e criar alertas para falhas repetidas.",
        evidence: sudoFails.slice(0, 4).map((entry) => entry.line),
      });
    }

    // Login direto como root.
    const rootLogins = parsed.filter((entry) =>
      /accepted (?:password|publickey) for root\b/.test(entry.lower),
    );
    if (rootLogins.length) {
      addFinding({
        id: "root-login",
        severity: "high",
        title: "Login direto como root",
        detail: `${rootLogins.length} login(s) de root aceito(s). Acesso direto ao superusuário amplia o impacto de qualquer erro ou credencial vazada.`,
        recommendation:
          "Desabilitar PermitRootLogin, usar sudo com conta nominal e revisar a sessão e os comandos executados.",
        evidence: rootLogins.slice(0, 3).map((entry) => entry.line),
      });
    }

    // Bloqueios de firewall, agrupados por origem.
    const firewallBlocks = parsed.filter((entry) =>
      /ufw block|iptables.*(?:drop|deny)|firewall.*deny/.test(entry.lower),
    );
    groupBy(firewallBlocks, (entry) => entry.source).forEach((entries, ip) => {
      addFinding({
        id: `fw-${ip}`,
        severity: entries.length >= 3 ? "medium" : "low",
        title: "Tráfego bloqueado pelo firewall",
        detail:
          `${entries.length} bloqueio(s) registrados para ${ip}. ` +
          (entries.length >= 3
            ? "O volume sugere varredura de portas."
            : "Pode ser ruído da internet ou uma tentativa isolada."),
        recommendation:
          "Confirmar a política do firewall, monitorar recorrência e correlacionar com outros eventos da mesma origem.",
        evidence: entries.slice(0, 4).map((entry) => entry.line),
      });
    });

    // Volume anormal de 404.
    const notFound = parsed.filter((entry) => entry.status === "404");
    if (notFound.length >= 6) {
      addFinding({
        id: "http-404",
        severity: notFound.length >= 15 ? "medium" : "low",
        title: "Volume elevado de respostas 404",
        detail: `${notFound.length} respostas 404 encontradas. Pode indicar enumeração de caminhos ou links quebrados.`,
        recommendation:
          "Correlacionar com os IPs de origem, revisar rotas expostas e considerar rate limiting para padrões repetidos.",
        evidence: notFound.slice(0, 4).map((entry) => entry.line),
      });
    }

    // Indicadores de webshell / execução remota.
    const webshell = parsed.filter((entry) =>
      /(?:eval\(|base64_decode|shell\.php|webshell|wget\s+https?:\/\/|curl\s+https?:\/\/|\/bin\/sh)/i.test(entry.line),
    );
    if (webshell.length) {
      addFinding({
        id: "webshell",
        severity: "high",
        title: "Indicadores de webshell ou execução remota",
        detail: `${webshell.length} linha(s) contêm comandos ou funções associadas a execução remota.`,
        recommendation:
          "Isolar o host, preservar evidências, revisar arquivos web recentes e verificar processos e conexões ativas.",
        evidence: webshell.slice(0, 4).map((entry) => entry.line),
      });
    }

    findings.sort(
      (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || a.title.localeCompare(b.title),
    );

    const score = Math.min(
      100,
      findings.reduce((total, finding) => total + SEVERITY_WEIGHT[finding.severity], 0),
    );
    const label = score === 0 ? "sem alertas" : score < 25 ? "baixo" : score < 50 ? "moderado" : score < 75 ? "alto" : "crítico";
    const uniqueIps = new Set(parsed.flatMap((entry) => entry.ips));

    return {
      lines: lines.length,
      totalLines: allLines.length,
      truncated: allLines.length > MAX_LINES,
      findings,
      score,
      label,
      uniqueIps: uniqueIps.size,
    };
  }

  function buildReportText(result) {
    const output = [
      "RELATÓRIO DE TRIAGEM — Alan Fraga (simulação local)",
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      "",
      `Linhas analisadas: ${result.lines}`,
      `Alertas: ${result.findings.length}`,
      `Risco: ${result.score}/100 (${result.label})`,
      `IPs únicos: ${result.uniqueIps}`,
      "",
    ];

    result.findings.forEach((finding, index) => {
      output.push(`${index + 1}. [${SEVERITY_LABEL[finding.severity].toUpperCase()}] ${finding.title}`);
      output.push(`   ${finding.detail}`);
      output.push(`   Ação sugerida: ${finding.recommendation}`);
      output.push("");
    });

    if (!result.findings.length) {
      output.push("Nenhum padrão suspeito identificado pelas regras atuais.");
    }

    output.push("Demonstração educacional. Regras simplificadas; não substitui um SIEM.");
    return output.join("\n");
  }

  function initLab() {
    const input = $("#log-input");
    const analyzeButton = $("#analyze-btn");
    const sampleButton = $("#sample-btn");
    const clearButton = $("#clear-btn");
    const reportStatus = $("#report-status");
    const reportContent = $("#report-content");
    const reportActions = $("#report-actions");
    const copyButton = $("#copy-report");
    const riskScore = $("#risk-score");
    const riskLabel = $("#risk-label");
    const riskRing = $("#risk-ring");
    const linesEl = $("#r-lines");
    const findingsEl = $("#r-findings");
    const ipsEl = $("#r-ips");

    if (!input || !analyzeButton || !reportContent) return;

    const initialEmpty = reportContent.firstElementChild
      ? reportContent.firstElementChild.cloneNode(true)
      : createEl("div", "report-empty");
    const circumference = 2 * Math.PI * 44;
    let lastResult = null;

    input.value = SAMPLE_LOGS;

    const setGauge = (score, label) => {
      if (riskRing) {
        riskRing.style.strokeDashoffset = String(circumference * (1 - score / 100));
        riskRing.style.stroke =
          score >= 75 ? "var(--red)" : score >= 50 ? "var(--amber)" : score >= 25 ? "var(--blue)" : "var(--accent)";
      }
      if (riskScore) riskScore.textContent = String(score);
      if (riskLabel) riskLabel.textContent = label;
    };

    const resetReport = () => {
      lastResult = null;
      if (reportStatus) {
        reportStatus.textContent = "AGUARDANDO";
        reportStatus.style.color = "";
        reportStatus.style.borderColor = "";
      }
      setGauge(0, "sem análise");
      if (linesEl) linesEl.textContent = "—";
      if (findingsEl) findingsEl.textContent = "—";
      if (ipsEl) ipsEl.textContent = "—";
      reportContent.replaceChildren(initialEmpty.cloneNode(true));
      if (reportActions) reportActions.hidden = true;
    };

    const renderReport = (result) => {
      if (reportStatus) {
        reportStatus.textContent = result.findings.length ? `${result.findings.length} ALERTA(S)` : "SEM ALERTAS";
        reportStatus.style.color = result.findings.length ? "var(--amber)" : "var(--teal)";
        reportStatus.style.borderColor = result.findings.length
          ? "rgba(242, 193, 92, 0.35)"
          : "rgba(95, 227, 192, 0.35)";
      }

      setGauge(result.score, result.label);
      if (linesEl) linesEl.textContent = String(result.lines);
      if (findingsEl) findingsEl.textContent = String(result.findings.length);
      if (ipsEl) ipsEl.textContent = String(result.uniqueIps);

      if (!result.findings.length) {
        const success = createEl("div", "report-success");
        const icon = createEl("span", "report-empty-icon");
        icon.innerHTML =
          '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3 27 7.4v8.2c0 7-4.4 12.4-11 14.4C9.4 28 5 22.6 5 15.6V7.4L16 3Z" stroke="currentColor" stroke-width="1.3"/><path d="m11 16 3.2 3.2L21 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        success.append(
          icon,
          createEl("strong", "", "Nenhum padrão suspeito encontrado"),
          createEl(
            "p",
            "",
            "As regras atuais não identificaram brute force, injeção web, varredura de caminhos ou falhas de privilégio.",
          ),
        );
        reportContent.replaceChildren(success);
      } else {
        const fragment = document.createDocumentFragment();

        result.findings.forEach((finding) => {
          const article = createEl("article", `finding sev-${finding.severity}`);
          const head = createEl("div", "finding-head");
          head.append(
            createEl("span", "sev-badge", SEVERITY_LABEL[finding.severity]),
            createEl("h3", "", finding.title),
          );

          const recommendation = createEl("p", "finding-rec");
          recommendation.append(
            createEl("strong", "", "Ação sugerida: "),
            document.createTextNode(finding.recommendation),
          );

          article.append(head, createEl("p", "", finding.detail), recommendation);

          if (finding.evidence && finding.evidence.length) {
            const details = document.createElement("details");
            const pre = createEl(
              "pre",
              "",
              finding.evidence
                .map((line) => (line.length > 220 ? `${line.slice(0, 220)}…` : line))
                .join("\n"),
            );
            details.append(createEl("summary", "", `Evidência (${finding.evidence.length})`), pre);
            article.append(details);
          }

          fragment.append(article);
        });

        reportContent.replaceChildren(fragment);
      }

      reportContent.scrollTop = 0;
      if (reportActions) reportActions.hidden = false;
    };

    const run = () => {
      const raw = input.value.trim();
      if (!raw) {
        showToast("Cole algumas linhas de log para analisar.");
        input.focus();
        return;
      }

      const clipped = raw.length > MAX_CHARS ? raw.slice(0, MAX_CHARS) : raw;
      if (raw.length > MAX_CHARS) {
        showToast("Entrada limitada a 200 mil caracteres.");
      }

      const result = analyzeLogs(clipped);
      lastResult = result;
      renderReport(result);

      if (result.truncated) {
        showToast(`Analisadas as primeiras ${MAX_LINES} linhas.`);
      }
    };

    analyzeButton.addEventListener("click", run);

    if (sampleButton) {
      sampleButton.addEventListener("click", () => {
        input.value = SAMPLE_LOGS;
        resetReport();
        showToast("Exemplo carregado. Clique em Analisar logs.");
        input.focus();
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        input.value = "";
        resetReport();
        input.focus();
      });
    }

    input.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        run();
      }
    });

    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        if (!lastResult) return;
        const copied = await copyText(buildReportText(lastResult));
        showToast(copied ? "Resumo da análise copiado" : "Não foi possível copiar o resumo");
      });
    }

    let autoRan = false;
    const labSection = $("#laboratorio");
    if (labSection && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || autoRan) return;
          autoRan = true;
          observer.disconnect();
          window.setTimeout(() => {
            if (!lastResult && input.value.trim()) run();
          }, 500);
        },
        { threshold: 0.18 },
      );
      observer.observe(labSection);
    }
  }

  /* ---------- contact form ---------- */

  function initForm() {
    const form = $("#contact-form");
    if (!form) return;

    const status = $("#form-status");
    const fields = {
      nome: {
        el: $("#nome"),
        error: $("#error-nome"),
        message: "Informe seu nome (mínimo 2 caracteres).",
        validate: (value) => value.trim().length >= 2,
      },
      email: {
        el: $("#email"),
        error: $("#error-email"),
        message: "Informe um e-mail válido.",
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()),
      },
      assunto: {
        el: $("#assunto"),
        error: $("#error-assunto"),
        message: "Selecione um assunto.",
        validate: (value) => value.trim().length > 0,
      },
      mensagem: {
        el: $("#mensagem"),
        error: $("#error-mensagem"),
        message: "Escreva uma mensagem com pelo menos 10 caracteres.",
        validate: (value) => value.trim().length >= 10,
      },
    };

    const setError = (field) => {
      if (!field.el || !field.error) return;
      const wrapper = field.el.closest(".field");
      if (wrapper) wrapper.classList.add("has-error");
      field.el.setAttribute("aria-invalid", "true");
      field.el.setAttribute("aria-describedby", field.error.id);
      field.error.textContent = field.message;
    };

    const clearError = (field) => {
      if (!field.el || !field.error) return;
      const wrapper = field.el.closest(".field");
      if (wrapper) wrapper.classList.remove("has-error");
      field.el.removeAttribute("aria-invalid");
      field.error.textContent = "";
    };

    Object.values(fields).forEach((field) => {
      if (!field.el) return;
      field.el.setAttribute("aria-describedby", field.error.id);
      const eventName = field.el.tagName === "SELECT" ? "change" : "input";
      field.el.addEventListener(eventName, () => clearError(field));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let firstInvalid = null;

      Object.values(fields).forEach((field) => {
        if (!field.el) return;
        if (field.validate(field.el.value)) {
          clearError(field);
        } else {
          setError(field);
          if (!firstInvalid) firstInvalid = field.el;
        }
      });

      if (firstInvalid) {
        if (status) {
          status.textContent = "Revise os campos destacados antes de enviar.";
          status.style.color = "var(--red)";
        }
        firstInvalid.focus();
        return;
      }

      const nome = fields.nome.el.value.trim();
      const email = fields.email.el.value.trim();
      const assunto = fields.assunto.el.value.trim();
      const mensagem = fields.mensagem.el.value.trim();

      const subject = `[Portfólio] ${assunto}`;
      const body = `Olá, Alan!\n\n${mensagem}\n\n—\n${nome}\n${email}`;

      if (status) {
        status.textContent = "Abrindo seu cliente de e-mail com a mensagem pronta…";
        status.style.color = "var(--accent)";
      }

      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast("Mensagem preparada. Confira seu cliente de e-mail.");
    });
  }

  function initCopyActions() {
    $$("[data-copy-email]").forEach((button) => {
      button.addEventListener("click", async () => {
        const copied = await copyText(EMAIL);
        showToast(copied ? "E-mail copiado para a área de transferência" : "Não foi possível copiar o e-mail");
      });
    });
  }

  function initPlatformHints() {
    if (isMac) return;

    const searchKbd = $(".search-trigger kbd");
    if (searchKbd) searchKbd.textContent = "Ctrl K";

    const searchTrigger = $(".search-trigger");
    if (searchTrigger) searchTrigger.setAttribute("aria-label", "Buscar Ctrl K");

    const footerKbd = $(".footer-kbd kbd");
    if (footerKbd) footerKbd.textContent = "Ctrl";

    const inlineKbd = $(".kbd-inline");
    if (inlineKbd) inlineKbd.textContent = "Ctrl↵";
  }

  function init() {
    const modules = [
      initHeader,
      initMenu,
      initScrollSpy,
      initReveal,
      initClock,
      initBackToTop,
      initHero,
      initToolkit,
      initPalette,
      initDialogs,
      initLab,
      initForm,
      initCopyActions,
      initPlatformHints,
    ];

    modules.forEach((module) => {
      try {
        module();
      } catch (error) {
        console.error(`Falha ao iniciar ${module.name}:`, error);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }


})();
