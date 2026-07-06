function showTab(tab) {
  document.getElementById('login-tab').classList.toggle('active', tab === 'login');
  document.getElementById('register-tab').classList.toggle('active', tab === 'register');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

function togglePassword(id) {
  const input = document.getElementById(id);
  const eye = input.parentElement.querySelector('.eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    eye.textContent = '🔒';
  } else {
    input.type = 'password';
    eye.textContent = '👁';
  }
}

async function registerUser(name, mail, password) {
  return supabaseFetch('/rest/v1/users', {
    method: 'POST',
    body: JSON.stringify({ name, mail, password, role: 'USER' }),
    headers: { 'Prefer': 'return=minimal' },
  });
}

async function loginUser(mail, password) {
  const users = await supabaseFetch(
    `/rest/v1/users?mail=eq.${encodeURIComponent(mail)}&password=eq.${encodeURIComponent(password)}&select=*`
  );
  return users.length > 0 ? users[0] : null;
}

document.addEventListener('DOMContentLoaded', () => {
  showTab('register');

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('username').value.trim();
    const mail = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');
    const successEl = document.getElementById('register-success');
    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    if (!name || !mail || !password) {
      errorEl.textContent = 'Todos los campos son obligatorios.';
      errorEl.classList.remove('hidden');
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      const existing = await supabaseFetch(
        `/rest/v1/users?mail=eq.${encodeURIComponent(mail)}&select=id`
      );
      if (existing.length > 0) {
        errorEl.textContent = 'Ya existe un usuario con ese correo electrónico.';
        errorEl.classList.remove('hidden');
        return;
      }

      await registerUser(name, mail, password);
      successEl.textContent = 'Usuario creado correctamente. Ya puedes iniciar sesión.';
      successEl.classList.remove('hidden');
      document.getElementById('register-form').reset();
    } catch (err) {
      errorEl.textContent = 'Error al registrar: ' + err.message;
      errorEl.classList.remove('hidden');
    }
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mail = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');

    if (!mail || !password) {
      errorEl.textContent = 'Todos los campos son obligatorios.';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      const user = await loginUser(mail, password);
      if (!user) {
        errorEl.textContent = 'Correo o contraseña incorrectos.';
        errorEl.classList.remove('hidden');
        return;
      }
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = 'Error al iniciar sesión: ' + err.message;
      errorEl.classList.remove('hidden');
    }
  });
});
