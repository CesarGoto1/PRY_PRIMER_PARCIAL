const USER_KEY = 'user';
const USERS_KEY = 'users';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  const user = getUser();
  return user && !!user.name;
}

export function setUser(name) {
  if (!name) return;
  const user = { name, loggedIn: true, lastLogin: new Date().toISOString() };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  updateGreeting();
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  updateGreeting();
}

export function updateGreeting() {
  const user = getUser();
  const greetingEl = document.getElementById('userGreeting');
  const loginBtn = document.getElementById('loginToggle');
  const registerBtn = document.getElementById('registerToggle');

  if (greetingEl) {
    greetingEl.textContent = user && user.name ? `Hola, ${user.name}` : '';
  }

  if (loginBtn) {
    if (user && user.name) {
      loginBtn.textContent = 'Cerrar sesión';
      loginBtn.classList.remove('btn-outline-light');
      loginBtn.classList.add('btn-light', 'text-success');
    } else {
      loginBtn.textContent = 'Iniciar sesión';
      loginBtn.classList.remove('btn-light', 'text-success');
      loginBtn.classList.add('btn-outline-light');
    }
  }

  if (registerBtn) {
    // ocultar registrarse cuando ya esté logueado
    registerBtn.style.display = user && user.name ? 'none' : '';
  }
}

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function addUser(username, password) {
  if (!username || !password) return false;
  const users = getUsers();
  if (users.find(u => u.username === username)) return false; // ya existe
  const passHash = await hashPassword(password);
  users.push({ username, passHash, createdAt: new Date().toISOString() });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

export async function registerUser(username, password) {
  const added = await addUser(username, password);
  if (added) {
    setUser(username); // iniciar sesión inmediatamente después de registrar
  }
  return added;
}

export async function validateUser(username, password) {
  if (!username || !password) return false;
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (!user) return false;
  const hash = await hashPassword(password);
  return user.passHash === hash;
}
// ...existing code...

document.addEventListener('DOMContentLoaded', () => {
  updateGreeting();

  const loginBtn = document.getElementById('loginToggle');
  const registerBtn = document.getElementById('registerToggle');
  const saveBtn = document.getElementById('saveUserBtn');
  let usernameInput = document.getElementById('usernameInput');
  let passwordInput = document.getElementById('passwordInput');
  const loginModalEl = document.getElementById('loginModal');
  const bsModal = loginModalEl ? new bootstrap.Modal(loginModalEl) : null;

  function ensureLoginFields() {
    if (!loginModalEl) return;
    usernameInput = document.getElementById('usernameInput');
    passwordInput = document.getElementById('passwordInput');

    if (!usernameInput && loginModalEl.querySelector('.modal-body')) {
      const inputHtml = `
        <div class="mb-2">
          <label for="usernameInput" class="form-label">Usuario</label>
          <input id="usernameInput" class="form-control" placeholder="Tu usuario">
        </div>
      `;
      loginModalEl.querySelector('.modal-body').insertAdjacentHTML('afterbegin', inputHtml);
      usernameInput = document.getElementById('usernameInput');
    }

    if (!passwordInput && loginModalEl.querySelector('.modal-body')) {
      const passHtml = `
        <div class="mb-2">
          <label for="passwordInput" class="form-label">Contraseña</label>
          <input id="passwordInput" type="password" class="form-control" placeholder="Tu contraseña">
        </div>
      `;
      const ui = loginModalEl.querySelector('#usernameInput');
      if (ui) ui.insertAdjacentHTML('afterend', passHtml);
      else loginModalEl.querySelector('.modal-body').insertAdjacentHTML('beforeend', passHtml);
      passwordInput = document.getElementById('passwordInput');
    }
  }

  function ensureRegisterModal() {
    let registerModalEl = document.getElementById('registerModal');
    if (registerModalEl) return registerModalEl;

    const html = `
      <div class="modal fade" id="registerModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-sm modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Registro</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <div class="mb-2">
                <label for="regNameInput" class="form-label">Usuario</label>
                <input id="regNameInput" class="form-control" placeholder="Tu usuario">
              </div>
              <div class="mb-2">
                <label for="regPasswordInput" class="form-label">Contraseña</label>
                <input id="regPasswordInput" type="password" class="form-control" placeholder="Contraseña">
              </div>
              <div class="small text-muted">Se guardará tu usuario y contraseña (localmente, hashed) para futuras reservas.</div>
            </div>
            <div class="modal-footer">
              <button type="button" id="registerCancelBtn" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" id="registerSaveBtn" class="btn btn-primary">Registrar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper.firstElementChild);
    attachRegisterSaveHandler();
    return document.getElementById('registerModal');
  }

  function attachRegisterSaveHandler() {
    const btn = document.getElementById('registerSaveBtn');
    if (!btn || btn._hasHandler) return;
    btn.addEventListener('click', async () => {
      const name = (document.getElementById('regNameInput').value || '').trim();
      const pass = (document.getElementById('regPasswordInput').value || '').trim();
      if (!name || !pass) {
        const el = document.getElementById('regNameInput');
        if (el) {
          el.classList.add('is-invalid');
          setTimeout(() => el.classList.remove('is-invalid'), 1000);
        }
        showToast('Usuario y contraseña requeridos.', 'warning');
        return;
      }
      const success = await registerUser(name, pass);
      if (success) {
        const bs = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        if (bs) bs.hide();
        showToast(`Registro exitoso. Bienvenido, ${name}`, 'success');
      } else {
        showToast('El usuario ya está registrado. Elige otro.', 'warning');
      }
    });
    btn._hasHandler = true;
  }

  // Forzar registro si no hay usuarios
  if (getUsers().length === 0) {
    const regEl = ensureRegisterModal();
    const bsReg = new bootstrap.Modal(regEl);
    bsReg.show();

    regEl.addEventListener('shown.bs.modal', () => {
      const regInput = document.getElementById('regNameInput');
      if (regInput) regInput.focus();
    }, { once: true });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      const regEl = ensureRegisterModal();
      attachRegisterSaveHandler();
      const bsReg = new bootstrap.Modal(regEl);
      // limpiar campos
      const rn = document.getElementById('regNameInput');
      const rp = document.getElementById('regPasswordInput');
      if (rn) rn.value = '';
      if (rp) rp.value = '';
      bsReg.show();
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (isLoggedIn()) {
        clearUser();
        showToast('Sesión cerrada correctamente', 'success');
      } else {
        if (getUsers().length === 0) {
          const regEl = ensureRegisterModal();
          const bsReg = new bootstrap.Modal(regEl);
          bsReg.show();
          return;
        }
        if (bsModal) {
          ensureLoginFields();
          usernameInput = document.getElementById('usernameInput');
          passwordInput = document.getElementById('passwordInput');
          if (usernameInput) usernameInput.value = '';
          if (passwordInput) passwordInput.value = '';
          bsModal.show();
        }
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      ensureLoginFields();
      usernameInput = document.getElementById('usernameInput');
      passwordInput = document.getElementById('passwordInput');

      const name = (usernameInput?.value || '').trim();
      const pass = (passwordInput?.value || '').trim();

      if (name && pass) {
        const valid = await validateUser(name, pass);
        if (!valid) {
          if (usernameInput) usernameInput.classList.add('is-invalid');
          if (passwordInput) passwordInput.classList.add('is-invalid');
          showToast('Usuario o contraseña incorrectos. Regístrate si no tienes cuenta.', 'warning');
          setTimeout(() => {
            if (usernameInput) usernameInput.classList.remove('is-invalid');
            if (passwordInput) passwordInput.classList.remove('is-invalid');
          }, 1200);
          return;
        }

        setUser(name);
        if (bsModal) bsModal.hide();
        showToast(`Bienvenido, ${name}`, 'success');
      } else {
        if (usernameInput) usernameInput.classList.add('is-invalid');
        if (passwordInput) passwordInput.classList.add('is-invalid');
        setTimeout(() => {
          if (usernameInput) usernameInput.classList.remove('is-invalid');
          if (passwordInput) passwordInput.classList.remove('is-invalid');
        }, 1200);
      }
    });
  }
});

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
  toastEl.role = 'alert';
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
}