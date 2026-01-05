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
  const rememberDays = Number.parseInt(gate.dataset.ageGateRememberDays || '0', 10);
  const rememberKey = 'age_gate_confirmed_at';
  const oneDayMs = 24 * 60 * 60 * 1000;

  const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const getFocusableElements = () =>
    Array.from(gate.querySelectorAll(focusableSelector)).filter(
      (el) =>
        !el.hasAttribute('disabled') &&
        !el.closest('[aria-hidden="true"]') &&
        !el.closest('[hidden]') &&
        el.getClientRects().length > 0,
    );

  const focusFirstElement = () => {
    const focusable = getFocusableElements();
    const first = focusable[0];
    if (first) {
      first.focus();
      return;
    }
    dialog?.focus();
  };

  const trapFocus = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements();
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
    dialog?.setAttribute('aria-labelledby', 'AgeGateHeading');
    dialog?.setAttribute('aria-describedby', 'AgeGateBody');
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
      if (Number.isFinite(rememberDays) && rememberDays > 0) {
        localStorage.setItem(rememberKey, String(Date.now()));
      } else {
        sessionStorage.setItem('age_gate_confirmed', 'true');
      }
    } catch (error) {
      console.warn('[age-gate] Unable to persist confirmation', error);
    }
  };

  const isConfirmed = () => {
    try {
      if (Number.isFinite(rememberDays) && rememberDays > 0) {
        const stored = Number(localStorage.getItem(rememberKey));
        if (!Number.isFinite(stored)) return false;
        return Date.now() - stored < rememberDays * oneDayMs;
      }
      return sessionStorage.getItem('age_gate_confirmed') === 'true';
    } catch (error) {
      return false;
    }
  };

  const showLocked = () => {
    if (content) content.hidden = true;
    if (locked) locked.hidden = false;
    gate.setAttribute('data-age-gate-state', 'locked');
    dialog?.setAttribute('aria-labelledby', 'AgeGateLockedHeading');
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
