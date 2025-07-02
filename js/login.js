// Helper SVG icon
function getStatusIcon(type) {
  switch(type) {
    case 'success':
      return '<svg class="status-icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#38a169"/><path d="M6 10l2.5 2.5L14 7" stroke="#fff" stroke-width="2" fill="none"/></svg>';
    case 'error':
      return '<svg class="status-icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#e53e3e"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" stroke-width="2"/></svg>';
    case 'warn':
      return '<svg class="status-icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#ecc94b"/><path d="M10 6v4m0 4h.01" stroke="#fff" stroke-width="2"/></svg>';
    case 'loading':
      return '<span class="spinner"></span>';
    default:
      return '';
  }
}

// Helper untuk set status
function setStatus(message, color = '#e53e3e', iconType = null) {
  const statusEl = document.getElementById('loginStatus');
  if (!statusEl) return;
  statusEl.innerHTML = '';
  if (iconType) {
    const iconEl = document.createElement('span');
    iconEl.className = 'status-icon';
    iconEl.innerHTML = getStatusIcon(iconType);
    statusEl.appendChild(iconEl);
  }
  const text = document.createElement('span');
  text.textContent = message;
  statusEl.appendChild(text);
  statusEl.style.color = color;
}

// Helper untuk tombol login
const loginBtn = document.getElementById('loginGoogle');
const loginBtnDefaultHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style="width:22px;"> Login dengan Google';
function setLoginBtnState(loading) {
  if (!loginBtn) return;
  loginBtn.disabled = loading;
  loginBtn.style.opacity = loading ? 0.7 : 1;
  loginBtn.innerHTML = loading ? '<span class="spinner"></span> Login dengan Google' : loginBtnDefaultHTML;
}

// Fokus otomatis ke tombol login
document.addEventListener('DOMContentLoaded', function() {
  if (loginBtn) loginBtn.focus();
});

// Cek status login
window._firebase.auth.onAuthStateChanged(async (user) => {
  if (!user) return;
  setStatus('Memeriksa akses...', '#333', 'loading');
  try {
    const querySnapshot = await window._firebase.firestore.collection('login').where('email', '==', user.email).get();
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      sessionStorage.setItem('user', JSON.stringify({
        email: data.email,
        role: data.role
      }));
      setStatus('Login sukses! Mengarahkan...', 'green', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } else {
      await window._firebase.auth.signOut();
      setStatus('Akses ditolak: Email tidak terdaftar.', '#e53e3e', 'error');
    }
  } catch (err) {
    setStatus('Terjadi error: ' + err.message, '#e53e3e', 'warn');
  }
});

// Tombol login Google
let loginInProgress = false;
if (loginBtn) {
  loginBtn.addEventListener('click', async function() {
    if (loginInProgress) return;
    loginInProgress = true;
    setStatus('Membuka Google Login...', '#333', 'loading');
    setLoginBtnState(true);
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await window._firebase.auth.signInWithPopup(provider);
    } catch (error) {
      setStatus(error.message, '#e53e3e', 'error');
      setLoginBtnState(false);
      loginInProgress = false;
    }
  });
} 