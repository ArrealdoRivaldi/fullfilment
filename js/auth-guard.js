// Auth Guard & User Info Display
(function() {
  // Load Firebase config if not already loaded
  if (!window._firebase) {
    console.error('Firebase config not loaded!');
    return;
  }
  const { auth, firestore } = window._firebase;

  // Helper: redirect to login if not logged in
  function requireLogin() {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = '/index.html';
        return;
      }
      // Check user access in Firestore
      try {
        const querySnapshot = await firestore.collection('login').where('email', '==', user.email).get();
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          // Show user info in navbar
          showUserInfo(user, data);
        } else {
          await auth.signOut();
          window.location.href = '/index.html';
        }
      } catch (err) {
        alert('Error: ' + err.message);
        await auth.signOut();
        window.location.href = '/index.html';
      }
    });
  }
 
  // Helper: show user info and logout button in navbar
  function showUserInfo(firebaseUser, userData) {
    let sidebarLogo = document.querySelector('.menu-sidebar .logo');
    let nav = document.querySelector('.page-container .w-full.bg-white.shadow');
    if (!nav) nav = document.body;
    let userDiv = document.getElementById('userInfoBox');
    const displayName = userData.name || firebaseUser.displayName || userData.email.split('@')[0];
    const email = userData.email;
    const role = userData.role || '';
    const nop = userData.nop || '-';
    const avatarUrl = firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff7849&color=fff&rounded=true&size=64`;
    // Inject custom CSS for dropdown arrow and card shadow
    if (!document.getElementById('userProfileCardStyle')) {
      const style = document.createElement('style');
      style.id = 'userProfileCardStyle';
      style.innerHTML = `
        #userProfileCard { box-shadow: 0 2px 12px #0001; }
        #userDropdown::before {
          content: '';
          display: block;
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 10px solid #fff;
          z-index: 51;
        }
      `;
      document.head.appendChild(style);
    }
    if (!userDiv) {
      userDiv = document.createElement('div');
      userDiv.id = 'userInfoBox';
      userDiv.className = 'w-full flex flex-col items-center';
      userDiv.innerHTML = `
        <div id="userProfileCard" class="bg-white rounded-xl shadow-lg flex flex-col items-center py-4 px-3 mb-2 relative" style="min-width:180px;">
          <img src="${avatarUrl}" alt="avatar" class="w-14 h-14 rounded-full border-2 border-orange-400 shadow mb-2">
          <div class="font-bold text-gray-800 text-base text-center">${displayName}</div>
          <div class="text-xs text-gray-500 text-center truncate w-full" title="${email}">${email}</div>
          <div class="text-xs text-green-600 font-semibold text-center">NOP: <span id='user-nop'>${nop}</span></div>
          <div class="text-xs text-blue-500 font-semibold text-center">${role}</div>
          <button id="userMenuBtn" class="mt-2 flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition focus:outline-none text-sm">
            <i class="fa fa-chevron-down text-gray-500"></i>
          </button>
          <div id="userDropdown" class="hidden absolute left-1/2 -translate-x-1/2 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
            <div class="relative">
              <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:10px solid #fff;"></div>
            </div>
            <button id="logoutBtn" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2">
              <i class="fa fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      `;
      // Tempatkan di bawah logo sidebar jika ada, fallback ke nav jika tidak ada
      if (sidebarLogo) {
        let oldUserDiv = document.getElementById('userInfoBox');
        if (oldUserDiv) oldUserDiv.remove();
        sidebarLogo.insertAdjacentElement('afterend', userDiv);
      } else {
        nav.style.position = 'relative';
        nav.appendChild(userDiv);
      }
    } else {
      // Update info jika sudah ada
      const card = userDiv.querySelector('#userProfileCard');
      card.querySelector('img').src = avatarUrl;
      card.querySelector('.font-bold').textContent = displayName;
      card.querySelectorAll('div.text-xs')[0].textContent = email;
      card.querySelectorAll('div.text-xs')[1].innerHTML = `NOP: <span id='user-nop'>${nop}</span>`;
      card.querySelectorAll('div.text-xs')[2].textContent = role;
    }
    // Dropdown logic
    const btn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    btn.onclick = function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    };
    document.addEventListener('click', function(e) {
      if (!userDiv.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
    // Bind logout
    document.getElementById('logoutBtn').onclick = async function() {
      await auth.signOut();
      window.location.href = '/index.html';
    };
  }

  // Expose for use in page scripts
  window.requireLogin = requireLogin;
})();

// Auto logout on idle
(function setupAutoLogoutOnIdle() {
  const IDLE_TIMEOUT_MINUTES = 15; // ganti sesuai kebutuhan
  let idleTimer = null;

  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      // Logout otomatis
      if (window._firebase && window._firebase.auth) {
        window._firebase.auth.signOut().then(() => {
          alert('Anda telah logout otomatis karena tidak ada aktivitas.');
          window.location.href = '/index.html';
        });
      }
    }, IDLE_TIMEOUT_MINUTES * 60 * 1000);
  }

  // Event yang dianggap aktivitas
  ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, resetIdleTimer, true);
  });

  // Mulai timer saat halaman dibuka
  resetIdleTimer();
})(); 