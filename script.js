const SUPABASE_URL = 'https://cfkucfmwbbpqyeehiknh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNma3VjZm13YmJwcXllZWhpa25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjAyMDYsImV4cCI6MjA5NjM5NjIwNn0.gIYLsWQigFkVQisfXnWcWeOVjToHRIoD5HlPqOF3zM4';

async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function insertProduct(product) {
  return supabaseFetch('/rest/v1/products', {
    method: 'POST',
    body: JSON.stringify(product),
    headers: { 'Prefer': 'return=minimal' },
  });
}

async function getProducts() {
  return supabaseFetch('/rest/v1/products?select=*');
}

async function getProduct(id) {
  const products = await supabaseFetch(`/rest/v1/products?id=eq.${id}&select=*`);
  return products.length > 0 ? products[0] : null;
}

async function deleteProduct(id) {
  return supabaseFetch(`/rest/v1/products?id=eq.${id}`, {
    method: 'DELETE',
  });
}

async function updateProduct(id, updates) {
  return supabaseFetch(`/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

async function uploadImage(file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const url = `${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al subir imagen: ${res.status} ${err}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
}

function getCurrentUser() {
  const data = localStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
}

function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

function isAdmin() {
  return hasRole('ADMIN');
}

function updateAuthButton() {
  const container = document.getElementById('auth-btn-container');
  if (!container) return;
  const user = getCurrentUser();
  if (user) {
    let buttons = '<button id="logout-btn">Cerrar Sesión</button>';
    if (isAdmin()) {
      buttons = '<a href="backoffice.html"><button>Admin</button></a>' + buttons;
    }
    container.innerHTML = buttons;
    document.getElementById('logout-btn').addEventListener('click', () => {
      document.getElementById('logout-modal').classList.add('show');
    });
  } else {
    container.innerHTML = '<a href="user.html"><button>Iniciar Sesión</button></a>';
  }
}

document.addEventListener('DOMContentLoaded', updateAuthButton);
