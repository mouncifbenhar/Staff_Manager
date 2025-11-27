
let staff = []; 
let assignedStaff = {
    meeting: [], reception: [], server: [], security: [], staff: [], archive: []
};


const zoneLimits = {
    meeting: 10, reception: 2, server: 3, security: 4, staff: 15, archive: 2
};

const zoneRestrictions = {
    reception: ['reception', 'manager'],
    server: ['it', 'manager'],
    security: ['security', 'manager'],
    archive: ['reception', 'it', 'security', 'manager', 'other']
};


const menuBtn = document.getElementById('menu-btn');
const menuBtnC = document.getElementById('menu-btn-c');
const sidebar = document.querySelector('.sidebar');
const addWorkerBtn = document.getElementById('btn_Add_Worker');
const addWorkerModal = document.getElementById('addworkermodal');
const closeModal = document.getElementById('closeModal');
const workerForm = document.getElementById('workerForm');
const experienceDiv = document.getElementById('experience');
const addExperienceBtn = document.getElementById('add-experience-btn');
const assignModal = document.getElementById('assignModal');
const closeAssignModal = document.getElementById('closeAssignModal');
const assignList = document.getElementById('assignList');
const staffDetailModal = document.getElementById('staffDetailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const staffDetailContent = document.getElementById('staffDetailContent');
const unassignedStaffDiv = document.getElementById('unassigned-staff');
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');


const patterns = {
    name: /^[A-Za-z\s]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
    url: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+(:\d+)?(\/[^\s?#]*)?(\?[^\s#]*)?(#[^\s]*)?$/
};



renderUnassignedStaff();
renderAssignedStaff();
setupEventListeners();



function setupEventListeners() {
   
    menuBtn.addEventListener('click', () => sidebar.classList.add('open'));
    menuBtnC.addEventListener('click', () => sidebar.classList.remove('open'));
    
    
    addWorkerBtn.addEventListener('click', () => addWorkerModal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => addWorkerModal.classList.add('hidden'));
    closeAssignModal.addEventListener('click', () => assignModal.classList.add('hidden'));
    closeDetailModal.addEventListener('click', () => staffDetailModal.classList.add('hidden'));
    
    
    workerForm.addEventListener('submit', handleAddWorker);
    addExperienceBtn.addEventListener('click', addExperienceField);
    
     
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
}


function handleAddWorker(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const experiences = [];
    
    document.querySelectorAll('.experience-block').forEach(block => {
        const company = block.querySelector('.company').value;
        const position = block.querySelector('.position').value;
        const startDate = block.querySelector('.start-date').value;
        const endDate = block.querySelector('.end-date').value;
        
        if (company && position && startDate && endDate) {
            if (new Date(startDate) >= new Date(endDate)) {
                alert('Start date must be before end date');
                return;
            }
            experiences.push({ company, position, startDate, endDate });
        }
    });
    
    const newStaff = {
        id: Date.now().toString(),
        name: document.getElementById('name').value,
        photo: document.getElementById('photo').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        role: document.getElementById('role').value,
        experiences: experiences
    };
    
    staff.push(newStaff);
    renderUnassignedStaff();
    addWorkerModal.classList.add('hidden');
    workerForm.reset();
    experienceDiv.innerHTML = '';
    photoPreview.style.display = 'none';
}

function validateForm() {
    let isValid = true;
    const fields = ['name', 'email', 'phone', 'role'];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        const errorElement = document.getElementById(field + 'Error');
        const value = element.value.trim();
        
        if (!value) {
            showError(element, errorElement, 'This field is required');
            isValid = false;
        } else if (patterns[field] && !patterns[field].test(value)) {
            showError(element, errorElement, `Invalid ${field} format`);
            isValid = false;
        } else {
            clearError(element, errorElement);
        }
    });
    
    
    const photoValue = photoInput.value.trim();
    if (photoValue && !patterns.url.test(photoValue)) {
        showError(photoInput, document.getElementById('photoError'), 'Invalid URL format');
        isValid = false;
    } else {
        clearError(photoInput, document.getElementById('photoError'));
    }
    
    return isValid;
}

function showError(element, errorElement, message) {
    element.classList.add('error');
    errorElement.textContent = message;
}

function clearError(element, errorElement) {
    element.classList.remove('error');
    errorElement.textContent = '';
}

function addExperienceField() {
    const expBlock = document.createElement('div');
    expBlock.className = 'experience-block';
    expBlock.innerHTML = `
        <input type="text" class="ex_input_block company" placeholder="Company Name">
        <input type="text" class="ex_input_block position" placeholder="Position">
        <input type="date" class="ex_input_block start-date" placeholder="Start Date">
        <input type="date" class="ex_input_block end-date" placeholder="End Date">
        <button type="button" class="remove-exp">Remove</button>
    `;
    
    expBlock.querySelector('.remove-exp').addEventListener('click', () => expBlock.remove());
    experienceDiv.appendChild(expBlock);
}

function renderUnassignedStaff() {
    const assignedIds = Object.values(assignedStaff).flat().map(s => s.id);
    const unassigned = staff.filter(s => !assignedIds.includes(s.id));
    
    unassignedStaffDiv.innerHTML = '';
    
    unassigned.forEach(employee => {
        const card = createStaffCard(employee);
        card.addEventListener('click', () => showStaffDetails(employee));
        unassignedStaffDiv.appendChild(card);
    });
}

function renderAssignedStaff() {
    Object.keys(assignedStaff).forEach(zone => {
        const zoneElement = document.querySelector(`[data-zone="${zone}"] .Zone-staff`);
        zoneElement.innerHTML = '';
        
        assignedStaff[zone].forEach(employee => {
            const card = createStaffCard(employee);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                unassignStaff(employee.id, zone);
            });
            
            card.addEventListener('click', () => showStaffDetails(employee));
            card.appendChild(removeBtn);
            zoneElement.appendChild(card);
        });
        
       
        const plusBtn = document.querySelector(`[data-zone="${zone}"] .plus`);
        plusBtn.onclick = () => openAssignModal(zone);
    });
}

function createStaffCard(employee) {
    const card = document.createElement('div');
    card.className = 'staff-card';
    card.innerHTML = `
        <img class="staff-photo" src="${employee.photo || 'https://via.placeholder.com/40'}" alt="${employee.name}">
        <div class="staff-info">
            <div class="staff-name">${employee.name}</div>
            <div class="staff-role">${employee.role}</div>
        </div>
    `;
    return card;
}


function openAssignModal(zone) {
    const assignedIds = Object.values(assignedStaff).flat().map(s => s.id);
    const availableStaff = staff.filter(s => 
        !assignedIds.includes(s.id) && isAllowedInZone(s.role, zone)
    );
    
    if (availableStaff.length === 0) {
        alert('No available staff for this zone');
        return;
    }
    
    assignList.innerHTML = '';
    availableStaff.forEach(employee => {
        const card = createStaffCard(employee);
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => assignStaff(employee.id, zone));
        assignList.appendChild(card);
    });
    
    assignModal.classList.remove('hidden');
}

function assignStaff(staffId, zone) {
    if (assignedStaff[zone].length >= zoneLimits[zone]) {
        alert(`Zone limit reached (${zoneLimits[zone]} staff)`);
        return;
    }
    
    const employee = staff.find(s => s.id === staffId);
    if (employee && isAllowedInZone(employee.role, zone)) {
        assignedStaff[zone].push(employee);
        renderAssignedStaff();
        renderUnassignedStaff();
        assignModal.classList.add('hidden');
    }
}

function unassignStaff(staffId, zone) {
    assignedStaff[zone] = assignedStaff[zone].filter(s => s.id !== staffId);
    renderAssignedStaff();
    renderUnassignedStaff();
}

function isAllowedInZone(role, zone) {
    if (role === 'manager') return true;
    if (role === 'cleaning') return zone !== 'archive';
    if (zoneRestrictions[zone]) {
        return zoneRestrictions[zone].includes(role);
    }
    return true;
}


function showStaffDetails(employee) {
    staffDetailContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <img src="${employee.photo || 'https://via.placeholder.com/150'}" 
                 alt="${employee.name}" 
                 style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #0A2540;">
            <h3>${employee.name}</h3>
            <p><strong>Role:</strong> ${employee.role}</p>
            <p><strong>Email:</strong> ${employee.email}</p>
            <p><strong>Phone:</strong> ${employee.phone}</p>
        </div>
        <div>
            <h4>Professional Experience</h4>
            ${employee.experiences && employee.experiences.length > 0 ? 
                employee.experiences.map(exp => `
                    <div style="border: 1px solid #0A2540; padding: 0.5rem; margin: 0.5rem 0; border-radius: 0.3rem;">
                        <p><strong>${exp.position}</strong> at ${exp.company}</p>
                        <p>${exp.startDate} to ${exp.endDate}</p>
                    </div>
                `).join('') : 
                '<p>No experience recorded</p>'
            }
        </div>
    `;
    staffDetailModal.classList.remove('hidden');
};












