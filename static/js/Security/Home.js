document.addEventListener("DOMContentLoaded", function () {
    const scanButton = document.getElementById("scan-button");
    const lastScanDetails = document.getElementById("last-scan-details");
    const logBody = document.getElementById("log-body");
    const successSound = document.getElementById("success-sound");
    const errorSound = document.getElementById("error-sound");
    const menuButton = document.querySelector(".menu-button");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const dateTimeElement = document.getElementById("current-date-time");
  
    let html5QrCode = null;
  
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie("csrftoken");
  
    // This function now also handles adding the new row to the table
    function processScan(data, errorMsg = null) {
        let detailsHtml = '';
        if (errorMsg) {
            detailsHtml = `
                <h3>Scan Failed</h3>
                <div class="scan-details">
                    <p><strong>Status:</strong> <span class="scan-status invalid">Error</span></p>
                    <p>${errorMsg}</p>
                </div>`;
            if (errorSound) errorSound.play();
        } else {
            const statusClass = data.scanType.toLowerCase();
            detailsHtml = `
                <h3>Scan Successful</h3>
                <div class="scan-details">
                    <p><strong>Name:</strong> <span>${data.studentName}</span></p>
                    <p><strong>ID:</strong> <span>${data.studentId}</span></p>
                    <p><strong>Time:</strong> <span>${data.scanTime}</span></p>
                    <p><strong>Status:</strong> <span class="scan-status ${statusClass}">${data.scanType}</span></p>
                </div>`;
            if (successSound) successSound.play();
            
            // Create a new table row and add it to the top of the log
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${data.studentName}</td>
                <td>${data.studentId}</td>
                <td><span class="scan-status ${statusClass}">${data.scanType}</span></td>
                <td>${data.scanTime}</td>
            `;

            // Remove the "No activity yet" message if it exists
            const noActivityRow = logBody.querySelector('td[colspan="4"]');
            if (noActivityRow) {
                noActivityRow.parentElement.remove();
            }
            logBody.prepend(newRow); // Add the new scan to the top of the table
        }
        lastScanDetails.innerHTML = detailsHtml;
    }
  
    function onScanSuccess(decodedText, decodedResult) {
      stopScanning();
  
      // The QR code contains only the ID, so we build the full URL.
      const fullApiUrl = `/Services/Request/verify/pass/${decodedText}/`;
      
      fetch(fullApiUrl, {
          method: 'POST',
          headers: {
              'X-CSRFToken': csrftoken,
              'Content-Type': 'application/json'
          },
      })
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
          if (ok) {
              processScan(data);
          } else {
              processScan(null, data.message);
          }
      })
      .catch(error => {
          console.error('Error:', error);
          processScan(null, 'A network error occurred. Please check your connection.');
      });
    }
  
    function startScanning() {
        html5QrCode = new Html5Qrcode("qr-reader");
        lastScanDetails.innerHTML = `<h3>Scanning...</h3><div class="scan-details"><p>Please present a QR code to the camera.</p></div>`;
        
        html5QrCode.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: { width: 250, height: 250 } }, 
            onScanSuccess, 
            () => {} 
        )
        .then(() => {
            scanButton.innerHTML = '<span>Stop Scanning</span>';
            scanButton.classList.remove('btn-primary');
            scanButton.classList.add('btn-danger');
        })
        .catch(err => {
            processScan(null, 'Could not access camera. Please grant permission.');
        });
    }
  
    function stopScanning() {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                scanButton.innerHTML = '<span>Start Scanning</span>';
                scanButton.classList.remove('btn-danger');
                scanButton.classList.add('btn-primary');
                document.getElementById('qr-reader').innerHTML = '';
            });
        }
    }
    
    scanButton.addEventListener("click", () => {
        if (html5QrCode && html5QrCode.isScanning) {
            stopScanning();
        } else {
            startScanning();
        }
    });
  
    function toggleSidebar() {
        sidebar.classList.toggle('visible');
        overlay.classList.toggle('visible');
    }
  
    menuButton.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

});