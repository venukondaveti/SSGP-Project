document.addEventListener('DOMContentLoaded', function() {
    // --- Get all the elements we need to work with ---
    const form = document.getElementById('leaveRequestForm');
    const requestTypeRadios = document.querySelectorAll('input[name="requestType"]');
    const returnDateGroup = document.getElementById('return-date-group');
    const returnDateInput = document.getElementById('returnDateTime');
    const departureInput = document.getElementById('departureDateTime');
    const errorDisplay = document.getElementById('form-errors');
    const studentPhoneInput = document.getElementById('mobileNo');
    const parentPhoneInput = document.getElementById('parentContact');


    // --- Helper functions for showing and clearing errors ---
    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
    }

    function clearErrors() {
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';
    }
    
    // --- Function to set the minimum selectable date to now ---
    function setMinDateTime() {
        const now = new Date();
        // Adjust for timezone offset to get the correct local time in YYYY-MM-DDTHH:mm format
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const minDateTime = now.toISOString().slice(0, 16);
        
        departureInput.min = minDateTime;
        returnDateInput.min = minDateTime;
    }

    // --- This function shows or hides the return date field ---
    function toggleReturnDate() {
        const selectedType = document.querySelector('input[name="requestType"]:checked').value;

        if (selectedType === 'outing') {
            returnDateGroup.style.display = 'none';
            returnDateInput.required = false;
        } else {
            returnDateGroup.style.display = 'block';
            returnDateInput.required = true;
        }
    }

    // --- Event listeners ---
    requestTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleReturnDate);
    });

    departureInput.addEventListener('input', clearErrors);
    returnDateInput.addEventListener('input', clearErrors);
    parentPhoneInput.addEventListener('input', clearErrors);

    // --- This function runs just before the form is submitted for validation ---
    form.addEventListener('submit', function(event) {
        clearErrors();

        const requestType = document.querySelector('input[name="requestType"]:checked').value;
        const departure = new Date(departureInput.value);
        const now = new Date();

        // Validation 1: Check if departure date is in the past
        // We allow a 1-minute grace period for delays in form submission.
        if (departure < (now - 60 * 1000)) {
            showError('Error: Departure date and time cannot be in the past.');
            event.preventDefault(); // Stop the form from submitting
            return; // Exit the function
        }

        // Validation 2: For 'leave' requests, check if return is after departure
        if (requestType === 'leave') {
            if (departureInput.value && returnDateInput.value) {
                const returnDate = new Date(returnDateInput.value);
                if (returnDate <= departure) {
                    showError('Error: Return date and time must be after the departure date and time.');
                    event.preventDefault(); // Stop the form from submitting
                    return;
                }
            }
        }
        
        // Validation 3: Check if student and parent phone numbers are the same
        const studentPhone = studentPhoneInput.value.trim();
        const parentPhone = parentPhoneInput.value.trim();

        if (studentPhone && parentPhone && studentPhone === parentPhone) {
            showError("Error: Parent's contact number cannot be the same as the student's number.");
            event.preventDefault(); // Stop the form from submitting
            return;
        }
    });

    // --- Initial setup when the page loads ---
    toggleReturnDate();
    setMinDateTime(); // Set the minimum selectable date and time
});