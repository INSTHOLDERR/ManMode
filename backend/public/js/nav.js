document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res  = await fetch("/dashboard");
    const data = await res.json();
    const area       = document.getElementById("navUserArea");
    const mobileArea = document.getElementById("mobileAuthArea");
    if (!area) return;

    if (res.ok) {
      const name    = data.userName || '';
      const initial = name?.[0]?.toUpperCase() || 'U';
      const imgTag  = data.userImage
        ? `<img src="${data.userImage}" class="mm-user-avatar" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
           <div class="mm-user-initials" style="display:none">${initial}</div>`
        : `<div class="mm-user-initials">${initial}</div>`;

      area.innerHTML = `
        <div style="display:flex;align-items:center;gap:.375rem;">
          <a href="/userwishlist" class="mm-icon-btn" title="Wishlist">
            <i class="fas fa-heart"></i>
            <span class="mm-badge" id="wishlistBadge">${data.wishlistCount||0}</span>
          </a>
          <a href="/usercart" class="mm-icon-btn" title="Cart">
            <i class="fas fa-shopping-cart"></i>
            <span class="mm-badge" id="cartBadge">${data.cartCount||0}</span>
          </a>
          <div class="mm-user-wrap">
            <div class="mm-user-trigger" id="userTrigger">
              ${imgTag}
              <span class="mm-user-name">${name}</span>
              <i class="fas fa-chevron-down mm-chevron"></i>
            </div>
            <div class="mm-dropdown" id="userDropdown">
              <div class="mm-dropdown-header">
                <p class="mm-dropdown-name">${name}</p>
                <p class="mm-dropdown-email">${data.userEmail||''}</p>
              </div>
              <a href="/userprofile"><i class="fas fa-user" style="width:1rem;text-align:center;"></i> My Profile</a>
              <a href="/useraddress"><i class="fas fa-map-marker-alt" style="width:1rem;text-align:center;"></i> Addresses</a>
              <a href="/userorders"><i class="fas fa-box" style="width:1rem;text-align:center;"></i> My Orders</a>
              <a href="/userwallet"><i class="fas fa-wallet" style="width:1rem;text-align:center;"></i> Wallet</a>
              <a href="/userwishlist"><i class="fas fa-heart" style="width:1rem;text-align:center;"></i> Wishlist</a>
              <a href="/logout" class="logout"><i class="fas fa-sign-out-alt" style="width:1rem;text-align:center;"></i> Logout</a>
            </div>
          </div>
        </div>
      `;

      // Dropdown toggle
      const trigger = document.getElementById('userTrigger');
      const drop    = document.getElementById('userDropdown');
      trigger.addEventListener('click', e => {
        const isOpen = drop.classList.toggle('open');
        trigger.classList.toggle('open');
        e.stopPropagation();
        // Position dropdown: if too close to right edge, align left
        if (isOpen) {
          const rect = drop.getBoundingClientRect();
          if (rect.right > window.innerWidth - 8) {
            drop.style.right = '0';
            drop.style.left  = 'auto';
          }
        }
      });
      document.addEventListener('click', () => {
        drop.classList.remove('open');
        trigger.classList.remove('open');
      });

      // Mobile area
      if (mobileArea) {
        mobileArea.innerHTML = `
          <div style="display:flex;align-items:center;gap:.75rem;flex:1;">
            ${imgTag}
            <div>
              <p style="font-weight:700;font-size:.875rem;color:var(--ink);">${name}</p>
            </div>
          </div>
          <a href="/logout" class="mm-btn mm-btn-ghost mm-btn-sm" style="color:var(--red);border-color:var(--red);">Logout</a>
        `;
        // Add profile links to mobile menu if not already there
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && !mobileMenu.querySelector('.mm-mobile-profile-links')) {
          const profileLinks = document.createElement('div');
          profileLinks.className = 'mm-mobile-profile-links';
          profileLinks.style.cssText = 'padding:.5rem 1rem;display:flex;flex-direction:column;gap:.25rem;border-top:1px solid var(--border);';
          profileLinks.innerHTML = `
            <a href="/userprofile"  style="padding:.625rem 1rem;font-size:.875rem;color:var(--ink-3);display:flex;align-items:center;gap:.625rem;border-radius:8px;"><i class="fas fa-user" style="width:1rem;text-align:center;color:var(--gold);"></i> My Profile</a>
            <a href="/userorders"   style="padding:.625rem 1rem;font-size:.875rem;color:var(--ink-3);display:flex;align-items:center;gap:.625rem;border-radius:8px;"><i class="fas fa-box" style="width:1rem;text-align:center;color:var(--gold);"></i> My Orders</a>
            <a href="/userwallet"   style="padding:.625rem 1rem;font-size:.875rem;color:var(--ink-3);display:flex;align-items:center;gap:.625rem;border-radius:8px;"><i class="fas fa-wallet" style="width:1rem;text-align:center;color:var(--gold);"></i> Wallet</a>
            <a href="/userwishlist" style="padding:.625rem 1rem;font-size:.875rem;color:var(--ink-3);display:flex;align-items:center;gap:.625rem;border-radius:8px;"><i class="fas fa-heart" style="width:1rem;text-align:center;color:var(--gold);"></i> Wishlist</a>
          `;
          // Insert after mobileAuthArea
          mobileArea.parentNode.insertBefore(profileLinks, mobileArea.nextSibling);
        }
      }
    } else {
      area.innerHTML = `
        <div class="mm-auth-links">
          <a href="/register" class="mm-btn mm-btn-ghost mm-btn-sm">Register</a>
          <a href="/login"    class="mm-btn mm-btn-primary mm-btn-sm">Login</a>
        </div>
      `;
    }
  } catch (e) {
    console.error('Nav error:', e);
  }
});
