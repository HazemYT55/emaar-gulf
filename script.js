/* ============================================
   EMAAR GULF - ENTERPRISE JAVASCRIPT
   Real Estate Company Website Functionality
   ============================================ */

/* ============================================
   PROJECTS DATABASE
   Comprehensive array of project objects
   ============================================ */
const projectsDatabase = [];

// Load projects from LocalStorage on init
const savedProjects = localStorage.getItem('emaar_projects_v2');
if (savedProjects) {
    projectsDatabase.push(...JSON.parse(savedProjects));
}



/* ============================================
   DOM CONTENT LOADED - MAIN INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initializeNavigation();
    initializeMobileMenu();
    initializeHeroButtons();
    initializeProjects();
    initializeFilters();
    initializeStatistics();

    initializeContactForm();
    initializeLoginModal();
    initializeProjectModal();
    initializeBackToTop();
    initializeScrollAnimations();

    // Worker System Initialization
    initializeUploadModal();
    checkWorkerStatus();

    console.log('Emaar Gulf Website Initialized Successfully');
});

/* ============================================
   NAVIGATION FUNCTIONALITY
   ============================================ */
function initializeNavigation() {
    const header = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Scroll event for sticky header
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        updateActiveNavLink(sections, navLinks);
    });

    // Smooth scroll for nav links
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

function updateActiveNavLink(sections, navLinks) {
    const scrollPosition = window.scrollY + 150;

    sections.forEach(function (section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/* ============================================
   MOBILE MENU FUNCTIONALITY
   ============================================ */
function initializeMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
}

function closeMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ============================================
   HERO SECTION BUTTONS
   ============================================ */
function initializeHeroButtons() {
    const exploreBtn = document.getElementById('explore-projects-btn');
    const contactBtn = document.getElementById('contact-us-btn');

    if (exploreBtn) {
        exploreBtn.addEventListener('click', function () {
            scrollToSection('projects');
        });
    }

    if (contactBtn) {
        contactBtn.addEventListener('click', function () {
            scrollToSection('contact');
        });
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = document.getElementById('main-header');

    if (section && header) {
        const headerHeight = header.offsetHeight;
        const targetPosition = section.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

/* ============================================
   PROJECTS FUNCTIONALITY
   ============================================ */
function initializeProjects() {
    renderProjects(projectsDatabase);
    updateProjectCounts(projectsDatabase.length, projectsDatabase.length);
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    const noResults = document.getElementById('no-results-message');

    if (!grid) return;

    grid.innerHTML = '';

    if (projects.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    projects.forEach(function (project) {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
}

function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-project-id', project.id);
    card.setAttribute('tabindex', '0');

    const statusClass = 'status-' + project.status;
    const statusText = project.status.charAt(0).toUpperCase() + project.status.slice(1);

    // Check global worker status
    const isWorkerLoggedIn = localStorage.getItem('emaar_worker_logged_in') === 'true';

    card.innerHTML = `
        <div class="project-image-wrapper">
            <img src="${project.image}" alt="${project.title}" class="project-image" loading="lazy">
            <span class="project-status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="project-content">
            <span class="project-category">${project.categoryDisplay}</span>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-location">
                <span class="location-icon">📍</span>
                ${project.locationDisplay}
            </p>
            <p class="project-description">${project.description}</p>
            
            <!-- Documents Badge -->
            ${project.docs && project.docs.length > 0 ?
            `<div class="project-attachment-badge" style="margin-top:10px; font-size:0.8rem; color:var(--color-primary);">
                    📎 ${project.docs.length} Documents Attached
                </div>` : ''}
            
            <!-- Delete Button (Worker Only) -->
            ${isWorkerLoggedIn ?
            `<button class="delete-project-btn" 
                    style="margin-top:15px; padding:5px 10px; background:var(--color-error); color:white; border-radius:4px; font-size:0.8rem; width:100%;"
                    onclick="event.stopPropagation(); deleteProject(${project.id})">
                    Delete Project
                </button>` : ''}
        </div>
    `;

    // Add click handler for modal
    card.addEventListener('click', function () {
        openProjectModal(project);
    });

    // Add keyboard handler
    card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProjectModal(project);
        }
    });

    return card;
}

function updateProjectCounts(visible, total) {
    const visibleCount = document.getElementById('visible-count');
    const totalCount = document.getElementById('total-count');

    if (visibleCount) visibleCount.textContent = visible;
    if (totalCount) totalCount.textContent = total;
}

/* ============================================
   FILTER FUNCTIONALITY
   ============================================ */
function initializeFilters() {
    const statusFilter = document.getElementById('status-filter');
    const locationFilter = document.getElementById('location-filter');
    const categoryFilter = document.getElementById('category-filter');
    const resetBtn = document.getElementById('reset-filters-btn');
    const clearBtn = document.getElementById('clear-filters-btn');

    const filterHandler = function () {
        applyFilters();
    };

    if (statusFilter) statusFilter.addEventListener('change', filterHandler);
    if (locationFilter) locationFilter.addEventListener('change', filterHandler);
    if (categoryFilter) categoryFilter.addEventListener('change', filterHandler);

    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', resetFilters);
    }
}

function applyFilters() {
    const status = document.getElementById('status-filter').value;
    const location = document.getElementById('location-filter').value;
    const category = document.getElementById('category-filter').value;

    let filteredProjects = projectsDatabase.filter(function (project) {
        const statusMatch = status === 'all' || project.status === status;
        const locationMatch = location === 'all' || project.location === location;
        const categoryMatch = category === 'all' || project.category === category;

        return statusMatch && locationMatch && categoryMatch;
    });

    renderProjects(filteredProjects);
    updateProjectCounts(filteredProjects.length, projectsDatabase.length);
}

function resetFilters() {
    document.getElementById('status-filter').value = 'all';
    document.getElementById('location-filter').value = 'all';
    document.getElementById('category-filter').value = 'all';

    renderProjects(projectsDatabase);
    updateProjectCounts(projectsDatabase.length, projectsDatabase.length);
}

/* ============================================
   PROJECT MODAL FUNCTIONALITY
   ============================================ */
function initializeProjectModal() {
    const overlay = document.getElementById('project-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }

    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeProjectModal();
            }
        });
    }

    // Keyboard close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeProjectModal();
        }
    });
}

function openProjectModal(project) {
    const overlay = document.getElementById('project-modal-overlay');
    const content = document.getElementById('modal-content');

    if (!overlay || !content) return;

    const statusText = project.status.charAt(0).toUpperCase() + project.status.slice(1);
    const statusClass = 'status-' + project.status;

    content.innerHTML = `
        <div class="modal-image-section">
            <img src="${project.image}" alt="${project.title}" class="modal-project-image">
        </div>
        <div class="modal-details-section">
            <span class="project-status-badge ${statusClass}">${statusText}</span>
            <h2 class="modal-project-title" id="modal-title">${project.title}</h2>
            <p class="modal-project-location">
                <span>📍</span> ${project.locationDisplay}
            </p>
            <div class="modal-project-meta">
                <div class="meta-item">
                    <span class="meta-label">Category</span>
                    <span class="meta-value">${project.categoryDisplay}</span>
                </div>
                 <!-- Conditionally show units/completion if they exist -->
                ${project.units ? `
                <div class="meta-item">
                    <span class="meta-label">Units</span>
                    <span class="meta-value">${project.units}</span>
                </div>` : ''}
                 ${project.completion ? `
                <div class="meta-item">
                    <span class="meta-label">Completion</span>
                    <span class="meta-value">${project.completion}</span>
                </div>` : ''}
            </div>
            <div class="modal-project-description">
                <h3>Project Overview</h3>
                <p>${project.description}</p>
                
                ${project.docs && project.docs.length > 0 ? `
                <div class="modal-docs-section" style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border-light)">
                    <h4>Attached Documents</h4>
                    <ul class="docs-list" style="margin-top:10px;">
                        ${project.docs.map(doc => `
                            <li style="margin-bottom:8px; display:flex; align-items:center; gap:10px;">
                                <span class="doc-icon">📄</span> 
                                <span style="font-weight:500">${doc.name}</span> 
                                <span class="doc-type" style="color:var(--text-muted); font-size:0.8rem">(${doc.type})</span>
                            </li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${project.media && project.media.length > 0 ? `
                <div class="modal-media-section" style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border-light)">
                    <h4>Media Gallery</h4>
                    <p style="font-size:0.9rem; color:var(--text-muted); margin-top:5px;">
                        ${project.media.length} additional media files available on request.
                    </p>
                </div>
                ` : ''}
            </div>
            <div class="modal-actions">
                <button class="cta-button cta-primary" onclick="scrollToSection('contact'); closeProjectModal();">
                    Request Information
                </button>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(function () {
        overlay.classList.add('active');
    }, 10);

    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const overlay = document.getElementById('project-modal-overlay');

    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(function () {
            overlay.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
}

/* ============================================
   STATISTICS COUNTER ANIMATION
   ============================================ */
function initializeStatistics() {
    const counters = document.querySelectorAll('.counter');
    let animated = false;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !animated) {
                animated = true;
                animateCounters(counters);
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('statistics');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

function animateCounters(counters) {
    counters.forEach(function (counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = function () {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    });
}



/* ============================================
   CONTACT FORM VALIDATION
   ============================================ */
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    const messageField = document.getElementById('message');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    if (messageField) {
        messageField.addEventListener('input', updateCharacterCount);
    }

    // Real-time validation
    const inputs = form ? form.querySelectorAll('input, select, textarea') : [];
    inputs.forEach(function (input) {
        input.addEventListener('blur', function () {
            validateField(this);
        });
        input.addEventListener('input', function () {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    let isValid = true;

    // Validate all required fields
    const firstName = document.getElementById('first-name');
    const lastName = document.getElementById('last-name');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');
    const privacy = document.getElementById('privacy-consent');

    if (!validateField(firstName)) isValid = false;
    if (!validateField(lastName)) isValid = false;
    if (!validateField(email)) isValid = false;
    if (!validateField(subject)) isValid = false;
    if (!validateField(message)) isValid = false;
    if (!validateField(privacy)) isValid = false;

    if (isValid) {
        submitForm(form);
    }
}

function validateField(field) {
    const errorElement = document.getElementById(field.id + '-error');
    let isValid = true;
    let errorMessage = '';

    // Required check
    if (field.hasAttribute('required')) {
        if (field.type === 'checkbox' && !field.checked) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (field.value.trim() === '') {
            isValid = false;
            errorMessage = 'This field is required';
        }
    }

    // Email validation
    if (field.type === 'email' && field.value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Phone validation (optional)
    if (field.type === 'tel' && field.value.trim() !== '') {
        const phoneRegex = /^[\d\s\-+()]{7,20}$/;
        if (!phoneRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }

    // Update UI
    if (isValid) {
        field.classList.remove('error');
        if (errorElement) errorElement.textContent = '';
    } else {
        field.classList.add('error');
        if (errorElement) errorElement.textContent = errorMessage;
    }

    return isValid;
}

function updateCharacterCount() {
    const message = document.getElementById('message');
    const count = document.getElementById('message-count');

    if (message && count) {
        const length = message.value.length;
        count.textContent = length + ' / 1000 characters';

        if (length > 1000) {
            count.style.color = 'var(--color-error)';
        } else {
            count.style.color = '';
        }
    }
}

function submitForm(form) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const successMessage = document.getElementById('form-success');

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    // Simulate form submission
    setTimeout(function () {
        form.style.display = 'none';
        successMessage.style.display = 'block';
        showToast('Message sent successfully!', 'success');
    }, 1500);
}

/* ============================================
   LOGIN MODAL FUNCTIONALITY
   ============================================ */
function initializeLoginModal() {
    const defaultLoginBtn = document.getElementById('default-login-btn');
    const navLoginBtn = document.getElementById('nav-login-btn');
    const overlay = document.getElementById('login-modal-overlay');
    const closeBtn = document.getElementById('login-modal-close');
    const form = document.getElementById('worker-login-form');

    if (defaultLoginBtn) {
        defaultLoginBtn.addEventListener('click', openLoginModal);
    }

    if (navLoginBtn) {
        navLoginBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to logout?')) {
                disableWorkerMode();
                showToast('Logged out successfully', 'info');
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLoginModal);
    }

    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeLoginModal();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}

function openLoginModal() {
    const overlay = document.getElementById('login-modal-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(function () {
            overlay.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const overlay = document.getElementById('login-modal-overlay');
    const errorMessage = document.getElementById('login-error-message');

    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(function () {
            overlay.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }

    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('worker-username').value;
    const password = document.getElementById('worker-password').value;
    const errorMessage = document.getElementById('login-error-message');

    // Check for the required password: "Emaar Gulf Is The Best"
    if (password === 'Emaar Gulf Is The Best') {
        closeLoginModal();
        showToast('Welcome, ' + username + '!', 'success');

        // Persist login
        localStorage.setItem('emaar_worker_logged_in', 'true');
        localStorage.setItem('emaar_worker_username', username);

        enableWorkerMode(username);

    } else {
        errorMessage.style.display = 'block';
    }
}

/* ============================================
   BACK TO TOP BUTTON
   ============================================ */
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(function (element) {
        observer.observe(element);
    });
}

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */
function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    toast.textContent = message;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(function () {
        toast.style.opacity = '0';
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3000);
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function () {
                inThrottle = false;
            }, limit);
        }
    };
}

// Newsletter form handler
document.addEventListener('DOMContentLoaded', function () {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            if (email) {
                showToast('Thank you for subscribing!', 'success');
                this.reset();
            }
        });
    }
});

/* ============================================
   WORKER & UPLOAD FUNCTIONALITY
   ============================================ */
let isWorkerLoggedIn = false;

function checkWorkerStatus() {
    const loggedIn = localStorage.getItem('emaar_worker_logged_in') === 'true';
    if (loggedIn) {
        const username = localStorage.getItem('emaar_worker_username') || 'Worker';
        enableWorkerMode(username);
    }
}

function enableWorkerMode(username) {
    isWorkerLoggedIn = true;
    const workerActions = document.getElementById('header-worker-actions');
    const defaultLoginBtn = document.getElementById('default-login-btn');
    const navLoginBtn = document.getElementById('nav-login-btn');

    if (workerActions) workerActions.style.display = 'flex';
    if (defaultLoginBtn) defaultLoginBtn.style.display = 'none';
    if (navLoginBtn) {
        navLoginBtn.textContent = 'Worker: ' + username;
        navLoginBtn.classList.add('logged-in');
    }

    // Re-render projects to show delete buttons
    renderProjects(projectsDatabase);
}

function disableWorkerMode() {
    isWorkerLoggedIn = false;
    localStorage.removeItem('emaar_worker_logged_in');
    localStorage.removeItem('emaar_worker_username');

    const workerActions = document.getElementById('header-worker-actions');
    const defaultLoginBtn = document.getElementById('default-login-btn');
    const navLoginBtn = document.getElementById('nav-login-btn');

    if (workerActions) workerActions.style.display = 'none';
    if (defaultLoginBtn) defaultLoginBtn.style.display = 'block';

    // Re-render projects to remove delete buttons
    renderProjects(projectsDatabase);
}

function initializeUploadModal() {
    const addBtn = document.getElementById('add-project-btn');
    const overlay = document.getElementById('upload-modal-overlay');
    const closeBtn = document.getElementById('upload-modal-close');
    const form = document.getElementById('upload-project-form');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            overlay.style.display = 'flex';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
        });
    }

    if (form) {
        form.addEventListener('submit', handleProjectUpload);
    }
}

async function handleProjectUpload(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Uploading...';
    submitBtn.disabled = true;

    try {
        const title = document.getElementById('upload-title').value;
        const location = document.getElementById('upload-location').value;
        const category = document.getElementById('upload-category').value;
        const status = document.getElementById('upload-status').value;
        const description = document.getElementById('upload-description').value;

        // Handle Main Image (Base64)
        const imageFile = document.getElementById('upload-image').files[0];
        let imageBase64 = '';
        if (imageFile) {
            imageBase64 = await readFileAsBase64(imageFile);
        }

        // Handle Additional Media names
        const mediaFiles = document.getElementById('upload-media').files;
        const mediaList = Array.from(mediaFiles).map(f => ({ name: f.name, type: f.type }));

        // Handle Docs names
        const docFiles = document.getElementById('upload-docs').files;
        const docList = Array.from(docFiles).map(f => ({ name: f.name, type: f.type }));

        const newProject = {
            id: Date.now(), // Unique ID
            title,
            location,
            locationDisplay: formatLocation(location),
            category,
            categoryDisplay: capitalize(category),
            status,
            description,
            image: imageBase64,
            media: mediaList,
            docs: docList,
            uploadedBy: localStorage.getItem('emaar_worker_username'),
            date: new Date().toLocaleDateString()
        };

        projectsDatabase.unshift(newProject);
        saveProjects();
        renderProjects(projectsDatabase);

        // Reset and Close
        e.target.reset();
        document.getElementById('upload-modal-overlay').style.display = 'none';
        showToast('Project uploaded successfully!', 'success');

    } catch (error) {
        console.error(error);
        showToast('Error uploading project', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const index = projectsDatabase.findIndex(p => p.id === id);
    if (index > -1) {
        projectsDatabase.splice(index, 1);
        saveProjects();
        renderProjects(projectsDatabase);
        showToast('Project deleted', 'success');
    }
}

function saveProjects() {
    try {
        localStorage.setItem('emaar_projects_v2', JSON.stringify(projectsDatabase));
        updateProjectCounts(projectsDatabase.length, projectsDatabase.length);
    } catch (e) {
        showToast('Storage full! Delete some projects.', 'error');
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function formatLocation(loc) {
    const locations = {
        'dubai': 'Dubai, UAE',
        'abu-dhabi': 'Abu Dhabi, UAE',
        'sharjah': 'Sharjah, UAE',
        'riyadh': 'Riyadh, KSA',
        'jeddah': 'Jeddah, KSA',
        'doha': 'Doha, Qatar'
    };
    return locations[loc] || loc;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
