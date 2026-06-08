(function () {
  /* MailerLite integration. We POST the email to MailerLite's hosted form
     endpoint instead of relying on their JS form injection — that lets us
     keep our own visual form (m-mail-form) while still using their service.
     Account + form IDs come from the MailerLite dashboard:
       Account: 2370552
       Form (data-form code): KHRkLc
       Form (numeric ID):     188152873386772291 */
  var MAILERLITE_ACCOUNT = '2370552';
  var MAILERLITE_FORM = '188152873386772291';
  var MAILERLITE_ENDPOINT =
    'https://assets.mailerlite.com/jsonp/' +
    MAILERLITE_ACCOUNT +
    '/forms/' +
    MAILERLITE_FORM +
    '/subscribe';

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function subscribeToMailerLite(email) {
    // POST as multipart/form-data so the request is a simple cross-origin
    // POST that doesn't require a CORS preflight. We use mode: 'no-cors'
    // because MailerLite's JSONP endpoint doesn't return CORS headers;
    // we can't read the response body, but the subscription still goes
    // through (MailerLite handles the confirmation email separately).
    var body = new FormData();
    body.append('fields[email]', email);
    body.append('ml-submit', '1');
    body.append('anticsrf', 'true');
    return fetch(MAILERLITE_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: body
    });
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

      // Disable button while the request is in flight.
      setSubmitEnabled(false);
      subscribeToMailerLite(value)
        .then(function () {
          setState('success');
        })
        .catch(function () {
          setState('error');
        });
    });
  }

  document.querySelectorAll('.m-mail-form').forEach(setupMailForm);
  window.setupMailForm = setupMailForm;
})();
