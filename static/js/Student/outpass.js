// --- QR Code Generation ---

// Find the container element for the QR code
const qrcodeContainer = document.getElementById('qrcode');

// Check if both the container element and the QR_CODE_DATA variable are available
// This prevents errors if the script runs on a page without these elements.
if (qrcodeContainer && typeof QR_CODE_DATA !== 'undefined') {
    // Create a new QR code inside the 'qrcode' container
    new QRCode(qrcodeContainer, {
        text: QR_CODE_DATA,     // The data for the QR code (e.g., student ID, pass details)
        width: 100,             // Width of the QR code in pixels
        height: 100,            // Height of the QR code in pixels
        colorDark: "#000000",   // Color of the dark squares
        colorLight: "#ffffff",  // Color of the light background
        correctLevel: QRCode.CorrectLevel.H // High error correction level
    });
}

// --- Download Functionality ---

// Find the necessary elements from the webpage
const downloadBtn = document.getElementById('download-btn');
const passCard = document.getElementById('gatepass-card');
const backBtn = document.getElementById('back-button');
const passFooter = document.getElementById('pass-footer');

// Make sure the download button exists before adding a click event to it
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        // Temporarily hide the back button and footer for a clean screenshot
        if (backBtn) backBtn.style.visibility = 'hidden';
        if (passFooter) passFooter.style.visibility = 'hidden';

        // Get the student's username from the button's data attribute
        // This is useful for creating a unique filename.
        const studentUsername = downloadBtn.dataset.username || 'gatepass'; // Use a default name if username isn't set

        // Use html2canvas to take a "screenshot" of the gatepass card
        html2canvas(passCard, {
            scale: 2,       // Render at twice the resolution for better quality
            useCORS: true   // Allows loading images from other domains if needed
        }).then(canvas => {
            // Create a temporary link element to trigger the download
            const link = document.createElement('a');
            
            // Set the filename for the downloaded image
            link.download = `${studentUsername}.png`; 
            // Convert the canvas (the screenshot) to a PNG image URL
            link.href = canvas.toDataURL('image/png');
            // Programmatically click the link to start the download
            link.click();

        }).catch(err => {
            // If something goes wrong, log the error and notify the user
            console.error('Error during pass download:', err);
            alert('Could not download the pass. Please try again.');
        }).finally(() => {
            // This block runs whether the download succeeded or failed
            // Make the back button and footer visible again
            if (backBtn) backBtn.style.visibility = 'visible';
            if (passFooter) passFooter.style.visibility = 'visible';
        });
    });
}