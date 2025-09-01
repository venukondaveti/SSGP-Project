// This function runs after the entire HTML document has been fully loaded and is ready.
document.addEventListener('DOMContentLoaded', () => {

    // Find the two important elements we need to work with: the menu button and the sidebar itself.
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');

    // Make sure both elements actually exist on the page before trying to add any functionality.
    if (menuButton && sidebar) {
        
        // Add a 'click' event listener to the menu button.
        menuButton.addEventListener('click', (event) => {
            // Stop the click from bubbling up to other elements, which could cause unintended side effects.
            event.stopPropagation();
            // Toggle the 'open' class on the sidebar. If the class is there, it's removed. If it's not, it's added.
            // Your Home.css file will have a style for .sidebar.open to make it visible.
            sidebar.classList.toggle('open');
        });

        // Add a 'click' event listener to the entire document.
        // This is used to close the sidebar if the user clicks anywhere outside of it.
        document.addEventListener('click', (event) => {
            // Check if the place that was clicked is inside the sidebar.
            const isClickInsideSidebar = sidebar.contains(event.target);
            // Check if the thing that was clicked was the menu button itself.
            const isClickOnMenuButton = menuButton.contains(event.target);

            // If the sidebar is currently open AND the click was NOT inside the sidebar AND it was NOT the menu button,
            // then we know the user clicked outside, so we should close the sidebar.
            if (sidebar.classList.contains('open') && !isClickInsideSidebar && !isClickOnMenuButton) {
                sidebar.classList.remove('open');
            }
        });

        // Add a 'scroll' event listener to the window.
        // This will close the sidebar if the user starts scrolling the page.
        window.addEventListener('scroll', () => {
            // If the sidebar is currently open, remove the 'open' class to close it.
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
});
