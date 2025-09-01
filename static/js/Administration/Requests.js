// document.addEventListener('DOMContentLoaded', function () {
//     const requestList = document.getElementById('request-list');
//     const searchInput = document.getElementById('search-input');
//     const filterButtonsContainer = document.getElementById('filter-buttons');

//     let currentFilter = 'All';
//     let searchTerm = '';

//     let requests = [
//         { id: 1, name: 'Alex Johnson', type: 'Leave', start: '2025-08-01', end: '2025-08-05', reason: 'Family vacation.', status: 'Approved' },
//         { id: 2, name: 'Maria Garcia', type: 'Outpass', start: '2025-07-22', end: '2025-07-22', reason: 'Doctor\'s appointment.', status: 'Pending' },
//         { id: 3, name: 'Chen Wei', type: 'Leave', start: '2025-07-25', end: '2025-07-26', reason: 'Personal reasons.', status: 'Rejected' },
//         { id: 4, name: 'Samira Khan', type: 'Leave', start: '2025-09-10', end: '2025-09-15', reason: 'Attending a conference.', status: 'Pending' },
//     ];

//     function updateStats() {
//         document.getElementById('total-stat').textContent = requests.length;
//         document.getElementById('pending-stat').textContent = requests.filter(r => r.status === 'Pending').length;
//         document.getElementById('approved-stat').textContent = requests.filter(r => r.status === 'Approved').length;
//         document.getElementById('rejected-stat').textContent = requests.filter(r => r.status === 'Rejected').length;
//     }

//     function renderRequests() {
//         requestList.innerHTML = '';
        
//         const filteredRequests = requests.filter(req => {
//             const matchesFilter = currentFilter === 'All' || req.status === currentFilter;
//             const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase());
//             return matchesFilter && matchesSearch;
//         });

//         if (filteredRequests.length === 0) {
//             requestList.innerHTML = `<div style="text-align: center; color: #6b7280; padding: 2.5rem 0;"><i class="fas fa-folder-open fa-3x" style="margin-bottom: 0.75rem;"></i><p>No matching requests found.</p></div>`;
//             return;
//         }

//         filteredRequests.forEach(req => {
//             const statusClass = getStatusClass(req.status);
//             const requestElement = document.createElement('div');
//             requestElement.className = 'request-item';
//             requestElement.setAttribute('data-id', req.id);

//             const pendingActions = req.status === 'Pending' ? `
//                 <button onclick="updateStatus(${req.id}, 'Approved')" class="action-btn btn-approve"><i class="fas fa-check"></i> Approve</button>
//                 <button onclick="updateStatus(${req.id}, 'Rejected')" class="action-btn btn-reject"><i class="fas fa-times"></i> Reject</button>
//             ` : '';

//             requestElement.innerHTML = `
//                 <div class="request-info">
//                     <div class="name-status">
//                         <span class="name">${req.name}</span>
//                         <span class="status-badge ${statusClass}">${req.status}</span>
//                     </div>
//                     <p class="details"><strong>${req.type}</strong> from <strong>${formatDate(req.start)}</strong> to <strong>${formatDate(req.end)}</strong></p>
//                     <p class="reason">"${req.reason}"</p>
//                 </div>
//                 <div class="request-actions">
//                     ${pendingActions}
//                     <button onclick="deleteRequest(${req.id})" class="action-btn btn-delete"><i class="fas fa-trash-alt"></i></button>
//                 </div>
//             `;
//             requestList.appendChild(requestElement);
//         });
//         updateStats();
//     }

//     function getStatusClass(status) {
//         if (status === 'Approved') return 'status-approved';
//         if (status === 'Rejected') return 'status-rejected';
//         return 'status-pending';
//     }

//     function formatDate(dateString) {
//         const options = { year: 'numeric', month: 'short', day: 'numeric' };
//         return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
//     }

//     searchInput.addEventListener('input', (e) => {
//         searchTerm = e.target.value;
//         renderRequests();
//     });

//     filterButtonsContainer.addEventListener('click', (e) => {
//         if (e.target.tagName === 'BUTTON') {
//             currentFilter = e.target.dataset.filter;
//             document.querySelectorAll('#filter-buttons .filter-btn').forEach(btn => btn.classList.remove('active'));
//             e.target.classList.add('active');
//             renderRequests();
//         }
//     });

//     window.updateStatus = function(id, newStatus) {
//         const request = requests.find(r => r.id === id);
//         if (request) {
//             request.status = newStatus;
//             requests.sort((a, b) => (a.status === 'Pending' && b.status !== 'Pending') ? -1 : 1);
//             renderRequests();
//         }
//     }
    
//     window.deleteRequest = function(id) {
//         const requestElement = document.querySelector(`.request-item[data-id='${id}']`);
//         if (requestElement) {
//             requestElement.classList.add('removing');
//             setTimeout(() => {
//                 requests = requests.filter(r => r.id !== id);
//                 renderRequests();
//             }, 300);
//         }
//     }

//     // Initial render
//     renderRequests();
// });