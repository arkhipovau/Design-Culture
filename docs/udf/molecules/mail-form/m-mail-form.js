(function () {
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function setupMailForm(form) {
    if (!form || form.dataset.mailFormBound === '1') return;
    form.dataset.mailFormBound = '1';

    const input = form.querySelector('.a-mail-input');
    const hint = form.querySelector('.m-mail-form__hint');
    const submit = form.querySelector('.m-mail-form__submit');
    const consentText = 'Продолжая вы даете согласие на обработку персональных данных';
    const errorText = 'Ошибка! Пожалуйста, попробуйте снова';
    const initialValue = (input && input.value ? input.value : '').trim();

    if (!input || !submit) return;

    function setSubmitEnabled(enabled) {
      if (enabled) {
        submit.removeAttribute('aria-disabled');
        submit.disabled = false;
      } else {
        submit.setAttribute('aria-disabled', 'true');
        submit.disabled = true;
      }
    }

    function setState(state) {
      form.setAttribute('data-state', state);
      input.setAttribute(
        'data-state',
        state === 'success' ? 'success' : state === 'default' ? 'default' : state === 'error' ? 'error' : 'input'
      );

      if (state === 'default') {
        input.readOnly = false;
        input.placeholder = 'Ваш email';
        input.removeAttribute('aria-invalid');
        if (hint) hint.textContent = '';
        setSubmitEnabled(false);
      }

      if (state === 'input') {
        input.readOnly = false;
        input.removeAttribute('aria-invalid');
        if (hint) hint.textContent = consentText;
        setSubmitEnabled(isValidEmail(input.value.trim()));
      }

      if (state === 'error') {
        input.readOnly = false;
        input.setAttribute('aria-invalid', 'true');
        if (hint) hint.textContent = errorText;
        setSubmitEnabled(false);
      }

      if (state === 'success') {
        input.value = 'Ваша почта отправлена';
        input.readOnly = true;
        input.removeAttribute('aria-invalid');
        if (hint) hint.textContent = '';
        setSubmitEnabled(true);
      }
    }

    setState(initialValue ? 'input' : 'default');

    input.addEventListener('input', function () {
      if (form.getAttribute('data-state') === 'success') return;
      const value = input.value.trim();
      if (!value) {
        setState('default');
        return;
      }
      setState('input');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.getAttribute('data-state') === 'success') return;

      const value = input.value.trim();
      if (!isValidEmail(value)) {
        setState('error');
        return;
      }

      setState('success');
    });
  }

  document.querySelectorAll('.m-mail-form').forEach(setupMailForm);
  window.setupMailForm = setupMailForm;
})();
