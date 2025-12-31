/**
 * Toast Notification System
 */
const Toast = (function() {
    'use strict';

    let container = null;
    const TOAST_DURATION = 5000; // 5 seconds

    function init() {
        if (container) return;
        container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    function createToast(type, message) {
        init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');

        // Icon SVGs
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-text">${message}</span>
                <button class="toast-close" aria-label="Close notification">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        // Progress bar animation
        const progressBar = toast.querySelector('.toast-progress');
        let startTime = Date.now();
        let remainingTime = TOAST_DURATION;
        let animationId = null;
        let isPaused = false;

        function updateProgress() {
            if (isPaused) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.max(0, 1 - elapsed / remainingTime);

            progressBar.style.transform = `scaleX(${progress})`;

            if (progress > 0) {
                animationId = requestAnimationFrame(updateProgress);
            } else {
                removeToast();
            }
        }

        function removeToast() {
            if (animationId) cancelAnimationFrame(animationId);
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }

        // Pause on hover
        toast.addEventListener('mouseenter', () => {
            isPaused = true;
            if (animationId) cancelAnimationFrame(animationId);
            // Calculate remaining time
            const elapsed = Date.now() - startTime;
            remainingTime = Math.max(0, remainingTime - elapsed);
        });

        // Resume on mouse leave
        toast.addEventListener('mouseleave', () => {
            isPaused = false;
            startTime = Date.now();
            animationId = requestAnimationFrame(updateProgress);
        });

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', removeToast);

        // Start animation
        animationId = requestAnimationFrame(updateProgress);

        return toast;
    }

    return {
        success: (message) => createToast('success', message),
        error: (message) => createToast('error', message)
    };
})();

/**
 * Contact Form Handler
 */
(function() {
    'use strict';

    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('.btn-submit');
    const resetBtn = form.querySelector('.btn-reset');

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

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
                Toast.success('Message sent successfully! I\'ll get back to you soon.');
                form.reset();
            } else {
                const data = await response.json();
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.message).join(', ');
                    Toast.error(`Failed to send: ${errorMessages}`);
                } else {
                    Toast.error('Something went wrong. Please try again.');
                }
            }
        } catch (error) {
            Toast.error('Network error. Please check your connection and try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });

    // Handle reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            form.reset();
        });
    }
})();
