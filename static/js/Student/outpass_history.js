document.addEventListener('DOMContentLoaded', () => {
    const historyItems = document.querySelectorAll('.history-item');
    const panelOverlay = document.getElementById('details-panel-overlay');
    const panel = document.getElementById('details-panel');
    const panelTitle = document.getElementById('panel-title');
    const panelBody = document.getElementById('panel-body');
    const panelFooter = document.getElementById('panel-footer');
    const panelCloseBtn = document.getElementById('panel-close');

    if (!panel) return;

    // FIX: Aligned keys with Django model fields for clarity (e.g., 'request', 'approval', 'issue', 'exit', 'entry')
    const timelineSteps = {
        "request": "Request Sent",
        "approval": "Approved by Warden",
        "issue": "Pass Issued",
        "exit": "Exited Campus",
        "entry": "Returned to Campus"
    };

    const icons = {
        request: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>`,
        approval: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        issue: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>`,
        exit: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>`,
        entry: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>`
    };

    function showDetailsInPanel(passData) {
        let timelineHTML = `
            <div class="timeline-wrapper">
                <div class="timeline-line">
                    <div class="timeline-line-progress" style="height: 0%;"></div>
                </div>
        `;
        
        const currentStatus = passData.status;
        const statusKeys = Object.keys(timelineSteps);
        
        let completedSteps = 0;
        if (passData.requestTime) completedSteps++;
        if (passData.approvalTime) completedSteps++;
        if (passData.issueTime) completedSteps++;
        if (passData.exitTime) completedSteps++;
        if (passData.entryTime) completedSteps++;

        let progressPercentage = (completedSteps > 0) ? ((completedSteps - 1) / (statusKeys.length - 1)) * 100 : 0;
        if (currentStatus === 'completed') progressPercentage = 100;

        statusKeys.forEach((statusKey, index) => {
            // FIX: Look for data attributes that match our new keys (e.g., passData.requestTime, passData.exitTime)
            const time = passData[`${statusKey}Time`];
            const isCompleted = !!time;
            const icon = icons[statusKey] || '';

            timelineHTML += `
                <div class="timeline-step ${isCompleted ? 'completed' : ''}">
                    <div class="step-icon">${icon}</div>
                    <div class="step-details">
                        <h4>${timelineSteps[statusKey]}</h4>
                        <p>${time || 'Pending...'}</p>
                    </div>
                </div>
            `;
        });

        if (currentStatus === 'rejected') {
            timelineHTML += `
                <div class="timeline-step rejected active">
                    <div class="step-icon">!</div>
                    <div class="step-details">
                        <h4>Request Rejected</h4>
                        <p>${passData.rejectionReason || 'Reason not specified'}</p>
                    </div>
                </div>
            `;
            progressPercentage = 0; // No progress if rejected
        }

        timelineHTML += '</div>';
        panelBody.innerHTML = timelineHTML;

        setTimeout(() => {
            const progressLine = panelBody.querySelector('.timeline-line-progress');
            if (progressLine) {
                progressLine.style.height = `${progressPercentage}%`;
            }
        }, 100);

        if (currentStatus === 'issued') {
            const passUrl = `/Services/Request/ViewPass/${passData.id}/`; 
            panelFooter.innerHTML = `<a href="${passUrl}" class="btn btn-primary">View Digital Gate Pass</a>`;
            panelFooter.classList.remove('hidden');
        } else {
            panelFooter.classList.add('hidden');
        }
    }

    function openPanel() {
        panelOverlay.classList.add('visible');
        panel.classList.add('visible');
    }

    function closePanel() {
        panelOverlay.classList.remove('visible');
        panel.classList.remove('visible');
    }

    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            const passData = item.dataset;
            panelTitle.textContent = `${passData.requestType} to ${passData.destination}`;
            showDetailsInPanel(passData);
            openPanel();
        });
    });

    panelCloseBtn.addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);
});