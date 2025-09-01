document.addEventListener('DOMContentLoaded', () => {
    function debounce(func, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- DOM Element References ---
    const cards = {
        all: document.getElementById('show-all-students-card'),
        outside: document.getElementById('show-outside-card'),
        caretakers: document.getElementById('show-caretakers-card'),
        late: document.getElementById('show-late-card')
    };
    const tables = {
        all: document.getElementById('all-students-table'),
        outside: document.getElementById('outside-table'),
        caretakers: document.getElementById('caretakers-table'),
        late: document.getElementById('late-entry-table')
    };
    const filterGroups = {
        all: document.getElementById('all-students-filters'),
        outside: document.getElementById('outside-filters'),
        caretakers: document.getElementById('caretakers-filters'),
        late: document.getElementById('late-entry-filters')
    };
    const tbodies = {
        all: document.getElementById('all-students-tbody'),
        outside: document.getElementById('outside-tbody'),
        caretakers: document.getElementById('caretakers-tbody'),
        late: document.getElementById('late-entry-tbody')
    };
    
    // --- Filter Inputs ---
    const sharedSearchFilter = document.getElementById('shared-search-filter');
    
    const filters = {
        all: {
            year: document.getElementById('year-filter-all'),
            branch: document.getElementById('branch-filter-all'),
            hostel: document.getElementById('hostel-filter-all'),
            gender: document.getElementById('gender-filter-all')
        },
        outside: {
            requestType: document.getElementById('request-type-filter'),
            year: document.getElementById('year-filter-outside'),
            branch: document.getElementById('branch-filter-outside'),
            gender: document.getElementById('gender-filter-outside')
        },
        caretakers: {
            hostel: document.getElementById('hostel-filter-caretaker'),
            gender: document.getElementById('gender-filter-caretaker')
        },
        late: {
            year: document.getElementById('year-filter-late'),
            branch: document.getElementById('branch-filter-late'),
            gender: document.getElementById('gender-filter-late')
        }
    };

    let activeView = 'all'; // To track the current active view

    // --- View Switching Logic ---
    function switchView(viewName) {
        activeView = viewName;
        
        for (const key in cards) {
            cards[key].classList.toggle('card-active', key === viewName);
            tables[key].classList.toggle('hidden', key !== viewName);
            filterGroups[key].classList.toggle('hidden', key !== viewName);
        }
        
        applyFilters();
    }

    cards.all.addEventListener('click', () => switchView('all'));
    cards.outside.addEventListener('click', () => switchView('outside'));
    cards.caretakers.addEventListener('click', () => switchView('caretakers'));
    cards.late.addEventListener('click', () => switchView('late'));

    // --- Helper function to show/hide the 'No Results' message ---
    function updateNoResultsMessage(tbody) {
        const noResultsRow = tbody.querySelector('.js-no-results');
        if (!noResultsRow) return;

        let visibleRows = 0;
        for (const row of tbody.querySelectorAll('tr:not(.js-no-results)')) {
            if (row.style.display !== 'none') {
                visibleRows++;
            }
        }
        noResultsRow.style.display = (visibleRows === 0) ? '' : 'none';
    }

    // --- Master Filter Application ---
    function applyFilters() {
        let activeTbody;
        if (activeView === 'all') {
            filterAllStudents();
            activeTbody = tbodies.all;
        } else if (activeView === 'outside') {
            filterOutsideStudents();
            activeTbody = tbodies.outside;
        } else if (activeView === 'caretakers') {
            filterCaretakers();
            activeTbody = tbodies.caretakers;
        } else if (activeView === 'late') {
            filterLateEntryStudents();
            activeTbody = tbodies.late;
        }
        if (activeTbody) {
            updateNoResultsMessage(activeTbody);
        }
    }

    // --- Filtering Functions ---
    function filterAllStudents() {
        const query = sharedSearchFilter.value.toLowerCase();
        const yearQuery = filters.all.year.value;
        const branchQuery = filters.all.branch.value;
        const hostelQuery = filters.all.hostel.value;
        const genderQuery = filters.all.gender.value;

        for (const row of tbodies.all.querySelectorAll('tr:not(.js-no-results)')) {
            const name = row.cells[0].textContent.toLowerCase();
            const id = row.cells[1].textContent.toLowerCase();
            const gender = row.cells[2].textContent;
            const branch = row.cells[3].textContent;
            const year = row.cells[4].textContent;
            const hostel = row.cells[5].textContent;

            const queryMatch = name.includes(query) || id.includes(query);
            const yearMatch = !yearQuery || year === yearQuery;
            const branchMatch = !branchQuery || branch === branchQuery;
            const hostelMatch = !hostelQuery || hostel === hostelQuery;
            const genderMatch = !genderQuery || gender.toUpperCase() === genderQuery;

            row.style.display = (queryMatch && yearMatch && branchMatch && hostelMatch && genderMatch) ? '' : 'none';
        }
    }

    function filterOutsideStudents() {
        const query = sharedSearchFilter.value.toLowerCase();
        const typeQuery = filters.outside.requestType.value;
        const yearQuery = filters.outside.year.value;
        const branchQuery = filters.outside.branch.value;
        const genderQuery = filters.outside.gender.value;

        for (const row of tbodies.outside.querySelectorAll('tr:not(.js-no-results)')) {
            const name = row.cells[0].textContent.toLowerCase();
            const id = row.cells[1].textContent.toLowerCase();
            const gender = row.cells[2].textContent;
            const branch = row.cells[3].textContent;
            const year = row.cells[4].textContent;
            const type = row.cells[5].textContent;

            const queryMatch = name.includes(query) || id.includes(query);
            const typeMatch = !typeQuery || type.toLowerCase() === typeQuery;
            const yearMatch = !yearQuery || year === yearQuery;
            const branchMatch = !branchQuery || branch === branchQuery;
            const genderMatch = !genderQuery || gender.toUpperCase() === genderQuery;

            row.style.display = (queryMatch && typeMatch && yearMatch && branchMatch && genderMatch) ? '' : 'none';
        }
    }
    
    function filterCaretakers() {
        const query = sharedSearchFilter.value.toLowerCase();
        const hostelQuery = filters.caretakers.hostel.value;
        const genderQuery = filters.caretakers.gender.value;

        for (const row of tbodies.caretakers.querySelectorAll('tr:not(.js-no-results)')) {
            const name = row.cells[0].textContent.toLowerCase();
            const gender = row.cells[1].textContent;
            const hostel = row.cells[2].textContent;
            
            const queryMatch = name.includes(query);
            const hostelMatch = !hostelQuery || hostel === hostelQuery;
            const genderMatch = !genderQuery || gender.toUpperCase() === genderQuery;
            
            row.style.display = (queryMatch && hostelMatch && genderMatch) ? '' : 'none';
        }
    }

    function filterLateEntryStudents() {
        const query = sharedSearchFilter.value.toLowerCase();
        const yearQuery = filters.late.year.value;
        const branchQuery = filters.late.branch.value;
        const genderQuery = filters.late.gender.value;

        for (const row of tbodies.late.querySelectorAll('tr:not(.js-no-results)')) {
            const name = row.cells[0].textContent.toLowerCase();
            const id = row.cells[1].textContent.toLowerCase();
            const gender = row.cells[2].textContent;
            const branch = row.cells[3].textContent;
            const year = row.cells[4].textContent;

            const queryMatch = name.includes(query) || id.includes(query);
            const yearMatch = !yearQuery || year === yearQuery;
            const branchMatch = !branchQuery || branch === branchQuery;
            const genderMatch = !genderQuery || gender.toUpperCase() === genderQuery;

            row.style.display = (queryMatch && yearMatch && branchMatch && genderMatch) ? '' : 'none';
        }
    }

    // --- Event Listeners for Filters ---
    sharedSearchFilter.addEventListener('input', debounce(applyFilters));
    
    Object.values(filters.all).forEach(el => el.addEventListener('change', applyFilters));
    Object.values(filters.outside).forEach(el => el.addEventListener('change', applyFilters));
    Object.values(filters.caretakers).forEach(el => el.addEventListener('change', applyFilters));
    Object.values(filters.late).forEach(el => el.addEventListener('change', applyFilters));
    
    // Initial filter on page load
    applyFilters();
});
