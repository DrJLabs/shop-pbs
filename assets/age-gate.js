(() => {
  const gate = document.querySelector('[data-age-gate]');
  if (!gate) return;

  const enabled = gate.dataset.ageGateEnabled !== 'false';
  if (!enabled) return;

  const content = gate.querySelector('[data-age-gate-content]');
  const locked = gate.querySelector('[data-age-gate-locked]');
  const confirmButton = gate.querySelector('[data-age-gate-confirm]');
  const declineButton = gate.querySelector('[data-age-gate-decline]');
  const dialog = gate.querySelector('[role="dialog"]');

  const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const focusFirstElement = () => {
    const focusable = gate.querySelectorAll(focusableSelector);
    const first = focusable[0];
    if (first) {
      first.focus();
      return;
    }
    dialog?.focus();
  };

  const trapFocus = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(gate.querySelectorAll(focusableSelector)).filter(
      (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
    );
    if (focusable.length === 0) {
      event.preventDefault();
      dialog?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const openGate = () => {
    gate.hidden = false;
    gate.setAttribute('data-age-gate-state', 'open');
    document.body.classList.add('overflow-hidden');
    document.addEventListener('keydown', trapFocus);
    focusFirstElement();
  };

  const closeGate = () => {
    gate.hidden = true;
    gate.removeAttribute('data-age-gate-state');
    document.body.classList.remove('overflow-hidden');
    document.removeEventListener('keydown', trapFocus);
  };

  const markConfirmed = () => {
    try {
      sessionStorage.setItem('age_gate_confirmed', 'true');
    } catch (error) {
      console.warn('[age-gate] Unable to access sessionStorage', error);
    }
  };

  const isConfirmed = () => {
    try {
      return sessionStorage.getItem('age_gate_confirmed') === 'true';
    } catch (error) {
      return false;
    }
  };

  const showLocked = () => {
    if (content) content.hidden = true;
    if (locked) locked.hidden = false;
    gate.setAttribute('data-age-gate-state', 'locked');
    focusFirstElement();
  };

  if (!isConfirmed()) {
    openGate();
  }

  confirmButton?.addEventListener('click', () => {
    markConfirmed();
    closeGate();
  });

  declineButton?.addEventListener('click', () => {
    showLocked();
  });
})();
