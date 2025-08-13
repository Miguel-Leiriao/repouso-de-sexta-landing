// Menu móvel (abre/fecha e empurra conteúdo)
const btn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');

if (btn && menu) {
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    btn.classList.toggle('active', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Fecha menu ao clicar num link
  menu.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- Fases: alinhar a linha horizontal pelo centro vertical da 1ª card
function positionFasesLine() {
  const wrapper = document.querySelector('#fases .relative');
  const line = document.getElementById('fases-line-h');
  const firstCard = document.querySelector('#fases .card-brand');
  if (!wrapper || !line || !firstCard) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  const cardRect = firstCard.getBoundingClientRect();
  const topWithinWrapper = (cardRect.top - wrapperRect.top) + (cardRect.height / 2);
  line.style.top = `${topWithinWrapper}px`;
}
window.addEventListener('load', positionFasesLine);
window.addEventListener('resize', positionFasesLine);

// --- Modal sucesso + submit via Netlify (AJAX, 2s)
function encode(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

// --- Submit -> FormSubmit (AJAX) + Modal (2s) + Captcha dinâmico + Rate-limit
function setupAjaxForm() {
  const form = document.getElementById('newsletter');
  if (!form) return;

  const endpoint = 'https://formsubmit.co/ajax/fd6209e094064b6004cd9a61806f2610';
  const backdrop = document.getElementById('success-backdrop');
  const closeBtn = document.getElementById('success-close');

  // parâmetros anti‑abuso
  const MAX_NO_CAPTCHA = 2;   // primeiras 2 submissões sem captcha
  const MIN_INTERVAL_S = 15;  // pelo menos 15s entre submissões

  let autoCloseTimer = null;

  const openModal = () => {
    if (!backdrop) return;
    backdrop.classList.remove('hidden');
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(closeModal, 2000);
    closeBtn && closeBtn.focus();
  };

  const closeModal = () => {
    if (!backdrop) return;
    backdrop.classList.add('hidden');
    clearTimeout(autoCloseTimer);
  };

  // UX do fecho do modal
  backdrop && backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  closeBtn && closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const now = Date.now();
    const last = parseInt(localStorage.getItem('jj_last_submit') || '0', 10);
    const count = parseInt(localStorage.getItem('jj_submit_count') || '0', 10);

    // rate‑limit simples
    if (now - last < MIN_INTERVAL_S * 1000) {
      // opcional: mostra aviso diferente; por ora só ignora
      return;
    }

    const fd = new FormData(form);

    // honeypot
    if (fd.get('bot-field')) {
      form.reset();
      openModal();
      return;
    }

    // assunto/extra
    fd.append('_subject', 'Nova pré‑inscrição — Jornal de Jogos');
    fd.append('_origin', window.location.hostname);

    // CAPTCHA dinâmico do FormSubmit
    //  - até MAX_NO_CAPTCHA envios: sem captcha
    //  - depois: ativa _captcha=true
    if (count >= MAX_NO_CAPTCHA) {
      fd.append('_captcha', 'true');
    } else {
      fd.append('_captcha', 'false');
    }

    // template em tabela (mais legível no email)
    fd.append('_template', 'table');

    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd
      });
      if (!r.ok) throw new Error('Falhou o envio');

      // atualiza contadores anti‑abuso
      localStorage.setItem('jj_last_submit', String(now));
      localStorage.setItem('jj_submit_count', String(count + 1));

      form.reset();
      openModal();
    } catch (err) {
      console.error('Erro ao enviar:', err);
      // fallback: ainda mostra modal para não bloquear UX
      openModal();
    }
  });
}

window.addEventListener('load', setupAjaxForm);

