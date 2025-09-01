
document.addEventListener("DOMContentLoaded", function () {

  const toggleBtn = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  toggleBtn.addEventListener('click', (event) => {
  
    navLinks.classList.toggle('show');
    event.stopPropagation();
  });

  
  document.addEventListener('click', () => {

    if (navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
    }
  });


  window.addEventListener('scroll', () => {
    if (navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
    }
  });
});
