

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/dashboard");
    const data = await response.json();
    const iconsContainer = document.getElementById("iconsContainer");

    if (response.ok) {
      iconsContainer.innerHTML = `

        <div class="icon user-icon" id="userIcon">
          <img src="${data.userImage}" alt="User Icon" style="width: 30px; height: 30px; border-radius: 50%;">
        </div>
        <div class="dropdown-menu" id="userDropdown" style="display: none; top: 110px;">
          <a href="/userprofile">Profile</a>
          <a href="/useraddress">Address</a>
          <a href="/userordering">Orders</a>
          <a href="/userwallet">Wallet</a>
          <a class="user-logout" href="/logout">Logout</a>
        </div>
        <div class="icon wishlist-icon" onclick="location.href='/userwishlist'">
          ❤️<span class="badge" id="wishlistCount">${data.wishlistCount}</span>
        </div>
        <div class="icon cart-icon" onclick="location.href='/usercart'">
          🛒<span class="badge" id="cartCount">${data.cartCount}</span>
        </div>
        
        
      `;


      initializeDropdown();
    } else {
      iconsContainer.innerHTML = `
        <a class="user-logout" href="/register">Register</a>
        <a class="user-logout" href="/login">Login</a>
      `;
    }
  } catch (error) {
    console.error("Error loading user dashboard data:", error);
    iconsContainer.innerHTML = `
      <a class="user-logout" href="/register">Register</a>
      <a class="user-logout" href="/login">Login</a>
    `;
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menu-Button"); 
  const hiddenElements = document.getElementById("iconsContainer");

  menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("Menu button clicked");

    hiddenElements.classList.toggle("visible");
    menuButton.textContent = hiddenElements.classList.contains("visible") ? "✖" : "☰"; 
  });

  document.addEventListener("click", (event) => {
  
    if (!menuButton.contains(event.target) && !hiddenElements.contains(event.target)) {
      hiddenElements.classList.remove("visible");
      menuButton.textContent = "☰"; 
    }
  });
});


function initializeDropdown() {
  const userIcon = document.getElementById("userIcon");
  const dropdown = document.getElementById("userDropdown");

  userIcon.addEventListener("click", (event) => {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    event.stopPropagation();
  });

 
  document.addEventListener("click", (event) => {
    if (!userIcon.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.style.display = "none";
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchSuggestions = document.getElementById('searchSuggestions');

  searchInput.addEventListener('input', async (event) => {
    const query = event.target.value.trim();

    if (query.length === 0) {
      searchSuggestions.style.display = 'none';
      searchSuggestions.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`/search?query=${encodeURIComponent(query)}`); 
      const products = await response.json();

      searchSuggestions.innerHTML = '';

      if (products.length > 0) {
        products.forEach(product => {
        
          const mainImageUrl = product.images[0].replace(/\\/g, '/').replace('uploads', ''); 

         
          const li = document.createElement('li');
          li.textContent = `${product.name}`;

        
          li.addEventListener('click', () => {
            window.location.href = `/viewuser?id=${product._id}`;
          });

  
          const img = document.createElement('img');
          img.src = `http://localhost:5000/${mainImageUrl}`;
          img.alt = product.name;
          img.style.width = '40px';
          img.style.marginRight = '10px';

      
          li.prepend(img);
          searchSuggestions.appendChild(li);
        });
        searchSuggestions.style.display = 'block';
      } else {
   
        const noResult = document.createElement('li');
        noResult.textContent = 'The product is not available';
        noResult.style.color = 'red';
        noResult.style.fontWeight = 'bold';
        searchSuggestions.appendChild(noResult);

        searchSuggestions.style.display = 'block';
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  });

  document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !searchSuggestions.contains(event.target)) {
      searchSuggestions.style.display = 'none';
    }
  });
});







document.querySelector('.logout-button').addEventListener('click', async () => {
            try {
                const response = await fetch('/admin/adminlogout', { method: 'POST' });
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Logged Out',
                        text: 'You have been successfully logged out.',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        window.location.href = '/admin';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Logout Failed',
                        text: 'Failed to log out. Please try again.',
                        confirmButtonText: 'OK',
                    });
                }
            } catch (error) {
                console.error('Error logging out:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Unexpected Error',
                    text: 'An unexpected error occurred. Please try again.',
                    confirmButtonText: 'OK',
                });
            }
        });


  