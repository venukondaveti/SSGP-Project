
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');
    const pageWrapper = document.getElementById('page-wrapper');
    const mainContent = document.querySelector('.main-content');

    if (menuButton && sidebar && pageWrapper) {
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('open');
            } else {
                pageWrapper.classList.toggle('sidebar-collapsed');
            }
        });

        mainContent.addEventListener('click', () => {
            if (window.innerWidth > 768 && !pageWrapper.classList.contains('sidebar-collapsed')) {
                pageWrapper.classList.add('sidebar-collapsed');
            }
        });


        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
        window.addEventListener('click', () => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    function updateTime() {
        const datetimeElement = document.getElementById('datetime');
        if (datetimeElement) {
            const options = { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
            datetimeElement.textContent = new Date().toLocaleString('en-IN', options);
        }
    }
    updateTime();
    setInterval(updateTime, 1000);
});
