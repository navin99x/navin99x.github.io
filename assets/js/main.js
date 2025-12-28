/**
 * Contact Form Handler
 * Handles form submission with AJAX, shows success/error messages
 */
(function() {
    'use strict';

    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('.btn-submit');
    const resetBtn = form.querySelector('.btn-reset');
    const formMessage = document.getElementById('form-message');

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        hideMessage();

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showMessage('success', 'Message sent successfully! I\'ll get back to you soon.');
                form.reset();
            } else {
                const data = await response.json();
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.message).join(', ');
                    showMessage('error', `Failed to send: ${errorMessages}`);
                } else {
                    showMessage('error', 'Something went wrong. Please try again.');
                }
            }
        } catch (error) {
            showMessage('error', 'Network error. Please check your connection and try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });

    // Handle reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            form.reset();
            hideMessage();
        });
    }

    function showMessage(type, text) {
        formMessage.textContent = text;
        formMessage.className = 'form-message ' + type;
        formMessage.style.display = 'block';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideMessage() {
        formMessage.style.display = 'none';
        formMessage.className = 'form-message';
    }
})();
