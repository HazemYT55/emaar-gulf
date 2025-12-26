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

