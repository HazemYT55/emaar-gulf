
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
