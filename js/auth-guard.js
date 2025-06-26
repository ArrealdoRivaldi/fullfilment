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
    // Find navbar area
    let nav = document.querySelector('.page-container .w-full.bg-white.shadow');
    if (!nav) nav = document.body;
    let userDiv = document.getElementById('userInfoBox');
    if (!userDiv) {
      userDiv = document.createElement('div');
      userDiv.id = 'userInfoBox';
      userDiv.className = 'relative flex items-center ml-4';
      userDiv.innerHTML = `
        <button id="userMenuBtn" class="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <img src="${firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.email)}" alt="avatar" class="w-8 h-8 rounded-full border-2 border-pink-400 shadow-sm">
          <span class="hidden sm:inline text-gray-800 font-semibold">${userData.email}</span>
          <i class="fa fa-chevron-down text-gray-500 ml-1"></i>
        </button>
        <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
          <div class="px-4 py-3 border-b flex items-center gap-2">
            <img src="${firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.email)}" alt="avatar" class="w-10 h-10 rounded-full border-2 border-pink-400">
            <div>
              <div class="font-bold text-gray-800 text-sm">${userData.email}</div>
              <div class="text-xs text-gray-500">${userData.role || ''}</div>
            </div>
          </div>
          <button id="logoutBtn" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2">
            <i class="fa fa-sign-out-alt"></i> Logout
          </button>
        </div>
      `;
      // Place in navbar (right side)
      nav.style.position = 'relative';
      nav.appendChild(userDiv);
    } else {
      userDiv.querySelector('span').textContent = userData.email;
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