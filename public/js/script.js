/**
 * Main JavaScript Module
 * Handles form validation, API calls, and UI interactions
 */

// ========================================
// DOM Ready Handler
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize appropriate handlers based on current page
    initPasswordToggle();
    initPasswordStrength();
    initRegisterForm();
    initLoginForm();
    initVerificationPage();
});

// ========================================
// Utility Functions
// ========================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show error message for a form field
 * @param {string} fieldId - ID of the field
 * @param {string} message - Error message to display
 */
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.classList.add('visible');
        inputElement.classList.add('error');
        inputElement.classList.remove('success');
    }
}

/**
 * Clear error message for a form field
 * @param {string} fieldId - ID of the field
 */
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement && inputElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
        inputElement.classList.remove('error');
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', or 'warning'
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconSvg = getToastIcon(type);
    
    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Close notification">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    // Auto remove after 5 seconds
    setTimeout(() => removeToast(toast), 5000);
}

/**
 * Get SVG icon for toast type
 * @param {string} type - Toast type
 * @returns {string} - SVG markup
 */
function getToastIcon(type) {
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    return icons[type] || icons.success;
}

/**
 * Remove toast with animation
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
}

/**
 * Set button loading state
 * @param {HTMLElement} button - Button element
 * @param {boolean} loading - Loading state
 */
function setButtonLoading(button, loading) {
    const textSpan = button.querySelector('.btn-text');
    const loaderSpan = button.querySelector('.btn-loader');
    
    if (loading) {
        button.disabled = true;
        if (textSpan) textSpan.classList.add('hidden');
        if (loaderSpan) loaderSpan.classList.remove('hidden');
    } else {
        button.disabled = false;
        if (textSpan) textSpan.classList.remove('hidden');
        if (loaderSpan) loaderSpan.classList.add('hidden');
    }
}

/**
 * Make API request
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - Response data
 */
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        });
        
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        console.error('API request failed:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// ========================================
// Password Toggle Functionality
// ========================================

function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const eyeOpen = button.querySelector('.eye-open');
            const eyeClosed = button.querySelector('.eye-closed');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeOpen.classList.add('hidden');
                eyeClosed.classList.remove('hidden');
            } else {
                input.type = 'password';
                eyeOpen.classList.remove('hidden');
                eyeClosed.classList.add('hidden');
            }
        });
    });
}

// ========================================
// Password Strength Indicator
// ========================================

function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    if (!passwordInput || !strengthFill || !strengthText) return;
    
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);
        
        // Clear previous classes
        strengthFill.className = 'strength-fill';
        
        if (password.length === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = '';
            return;
        }
        
        // Apply strength class
        strengthFill.classList.add(strength.level);
        strengthText.textContent = strength.text;
    });
}

/**
 * Calculate password strength
 * @param {string} password - Password to evaluate
 * @returns {object} - Strength level and text
 */
function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (password.length >= 14) score++;
    
    // Character variety
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    // Determine level
    if (score <= 2) return { level: 'weak', text: 'Weak' };
    if (score <= 3) return { level: 'fair', text: 'Fair' };
    if (score <= 4) return { level: 'good', text: 'Good' };
    return { level: 'strong', text: 'Strong' };
}

// ========================================
// Registration Form Handler
// ========================================

function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input');
    
    // Real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input.id));
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) isValid = false;
        });
        
        if (!isValid) return;
        
        const submitBtn = document.getElementById('submit-btn');
        setButtonLoading(submitBtn, true);
        
        // Get form data
        const formData = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };
        
        // Make API request
        const result = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        setButtonLoading(submitBtn, false);
        
        if (result.success) {
            // Show success state
            form.classList.add('hidden');
            document.querySelector('.card-footer').classList.add('hidden');
            
            const successMessage = document.getElementById('success-message');
            const sentEmail = document.getElementById('sent-email');
            
            if (sentEmail) sentEmail.textContent = formData.email;
            successMessage.classList.remove('hidden');
            
            showToast(result.data.message, 'success');
        } else {
            showToast(result.data?.message || 'Registration failed', 'error');
            
            // Show field-specific errors
            if (result.data?.field) {
                showFieldError(result.data.field, result.data.message);
            }
        }
    });
}

/**
 * Validate a single form field
 * @param {HTMLInputElement} input - Input element
 * @returns {boolean} - True if valid
 */
function validateField(input) {
    const value = input.value.trim();
    const fieldId = input.id;
    
    clearFieldError(fieldId);
    
    // Required check
    if (!value) {
        showFieldError(fieldId, 'This field is required');
        return false;
    }
    
    // Field-specific validation
    switch (fieldId) {
        case 'username':
            if (value.length < 3) {
                showFieldError(fieldId, 'Username must be at least 3 characters');
                return false;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                showFieldError(fieldId, 'Username can only contain letters, numbers, and underscores');
                return false;
            }
            break;
            
        case 'email':
            if (!isValidEmail(value)) {
                showFieldError(fieldId, 'Please enter a valid email address');
                return false;
            }
            break;
            
        case 'password':
            if (value.length < 6) {
                showFieldError(fieldId, 'Password must be at least 6 characters');
                return false;
            }
            break;
    }
    
    // Mark as valid
    input.classList.add('success');
    return true;
}

// ========================================
// Login Form Handler
// ========================================

function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input');
    const verificationWarning = document.getElementById('verification-warning');
    
    // Real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim()) clearFieldError(input.id);
        });
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous warning
        if (verificationWarning) verificationWarning.classList.add('hidden');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!email) {
            showFieldError('email', 'Email is required');
            return;
        }
        if (!password) {
            showFieldError('password', 'Password is required');
            return;
        }
        
        const submitBtn = document.getElementById('submit-btn');
        setButtonLoading(submitBtn, true);
        
        // Make API request
        const result = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        setButtonLoading(submitBtn, false);
        
        if (result.success) {
            // Show success state
            form.classList.add('hidden');
            document.querySelector('.card-footer').classList.add('hidden');
            
            const successMessage = document.getElementById('success-message');
            const welcomeUser = document.getElementById('welcome-user');
            
            if (welcomeUser && result.data.user) {
                welcomeUser.textContent = result.data.user.username;
            }
            successMessage.classList.remove('hidden');
            
            showToast('Login successful!', 'success');
        } else {
            // Check if needs verification
            if (result.data?.needsVerification && verificationWarning) {
                verificationWarning.classList.remove('hidden');
            }
            
            showToast(result.data?.message || 'Login failed', 'error');
        }
    });
}

// ========================================
// Verification Page Handler
// ========================================

function initVerificationPage() {
    const loadingState = document.getElementById('loading-state');
    const successState = document.getElementById('success-state');
    const errorState = document.getElementById('error-state');
    
    if (!loadingState) return; // Not on verification page
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        // Show error state
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        document.getElementById('error-message').textContent = 'No verification token provided.';
        return;
    }
    
    // Verify token
    verifyEmailToken(token);
}

/**
 * Verify email token with API
 * @param {string} token - Verification token
 */
async function verifyEmailToken(token) {
    const loadingState = document.getElementById('loading-state');
    const successState = document.getElementById('success-state');
    const errorState = document.getElementById('error-state');
    
    const result = await apiRequest(`/api/auth/verify?token=${encodeURIComponent(token)}`);
    
    loadingState.classList.add('hidden');
    
    if (result.success) {
        successState.classList.remove('hidden');
    } else {
        errorState.classList.remove('hidden');
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = result.data?.message || 'Verification failed.';
        }
    }
}