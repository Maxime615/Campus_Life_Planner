import { loadRecords,saveRecords,validateImportData } from "./storage.js";
import { validateTitle,validateDuration,validateDate,validateTag,hasDuplicateWords } from "./validators.js";
import { filterRecords,highlightText } from "./search.js";

let state = {
    records: [],
    sortOption: 'date-desc',
    searchQuery:'',
    caseSensitive: false,
    durationCap: 300,
    unitInHours: false,
    editingId: null
};

document.addEventListener('DOMContentLoaded', async ()=>{
    state.records = await loadRecords();
    initEventListeners();
    render();
});

function initEventListeners(){
    document.querySelectorAll('.nav-Link').forEach(link =>{
        link.addEventListener('click', (e) =>{
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
                document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        const form = document.getElementById('entry-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit();
        });

        document.getElementById('regex-search-input').addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderTable();
        });

        document.getElementById('case-sensitive-toggle').addEventListener('change', (e) => {
            state.caseSensitive = e.target.checked;
            renderTable();
        });

        document.getElementById('sort-select').addEventListener('change', (e) =>{
            state.sortOption = e.target.value;
            renderTable();
        });

        document.getElementById('duration-cap').addEventListener('input', (e) =>{
            state.durationCap = parseFloat(e.target.value) || 0;
            updateDashboardStats();
        });

        document.getElementById('export-btn').addEventListener('click', exportJSON);
        document.getElementById('import-file').addEventListener('change', handleImportJSON);
        document.getElementById('unit-conversion-toggle').addEventListener('change', (e) =>{
            state.unitInHours = e.target.checked;
            renderTable();
            updateDashboardStats();
        })     
    }

    function handleFormSubmit(){
        const idField = document.getElementById('record-id').value;
        const title = document.getElementById('title').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const durationRaw = document.getElementById('duration').value;
        const tag = document.getElementById('tag').value.trim();

        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

        const titleRes = validateTitle(title);
        const dateRes = validateDate(dueDate);
        const durationRes = validateDuration(durationRaw);
        const tagRes = validateTag(tag);

        let hasError = false;
        if (!titleRes.valid) {document.getElementById('error-title').textContent = titleRes.message; hasError = true; }
        if (!dateRes.valid) { document.getElementById('error-dueDate').textContent = dateRes.message; hasError = true; }
    if (!durationRes.valid) { document.getElementById('error-duration').textContent = durationRes.message; hasError = true; }
    if (!tagRes.valid) { document.getElementById('error-tag').textContent = tagRes.message; hasError = true; }

    if (hasDuplicateWords(title)) {
        document.getElementById('error-title').textContent = 'Warning: Title contains duplicate consecutive words.';
  }

  if (hasError) return;

  const duration = parseFloat(durationRaw);
  const now = new Date().toISOString();

  if (idField){
    state.records = state.records.map(r => r.id === idField ? {
        ...r,
        title,
        dueDate,
        duration,
        tag,
        updatedAt: now
    } :r);
  }else{
    const newRecord = {
        id: 'rec_' + Date.now(),
        title,
        dueDate,
        duration,
        tag,
        createdAt: now,
        updatedAt: now
    };
    state.records.push(newRecord);
  }

  saveRecords(state.records);
  document.getElementById('entry-form').reset();
  document.getElementById('record-id').value = '';
  document.getElementById('form-heading').textContent = 'Add New Event / Task';

  render();
  document.querySelector('a[href= "records"]').click();
  }

  function render(){
    renderTable();
    updateDashboardStats();
  }

  function renderTable(){
    const tbody = document.getElementById('records-tbody');
    tbody.innerHTML = '';

    let filtered = filterRecords(state.records, state.searchQuery, state.caseSensitive);
    const regex = filterRecords.__lastRegex || null;

    filtered.sort((a,b) =>{
        if (state.sortOption === 'date-desc') return new Date(b.dueDate) - new Date(a.dueDate);  
        if (state.sortOption === 'date-asc') return new Date(a.dueDate) - new Date(b.dueDate);
        if (state.sortOption === 'title-asc') return a.title.localeCompare(b.title);
        if (state.sortOption === 'title-desc') return b.title.localeCompare(a.title);
        if (state.sortOption === 'duration-desc') return b.duration - a.duration;
        if (state.sortOption === 'duration-asc') return a.duration - b.duration;
        return 0;
    });

    if (filtered.length === 0){
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No records found.</td></tr>`;
        return;
    } 

    filtered.forEach(record => {
        const tr = document.createElement('tr');

        const displayDuration = state.unitInHours
        ? (record.duration / 60).toFixed(1) + 'hrs'
        : record.duration + 'mins';

        tr.innerHTML = `
        <td>${highlightText(record.title, regex)}</td>
        <td>${highlightText(record.dueDate, regex)}</td>
            <td>${highlightText(displayDuration, regex)}</td>
            <td>${highlightText(record.tag, regex)}</td>
            <td>
                <button class="edit-btn" data-id="${record.id}">Edit</button>
                <button class="delete-btn" data-id="${record.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => prepareEdit(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn =>{
        btn.addEventListener('click', () => deleteRecord(btn.dataset.id));
    });
  }

  function prepareEdit(id){
    const record = state.records.find(r => r.id === id);
    if (!record) return;

    document.getElementById('record-id').value = record.id;
    document.getElementById('title').value = record.title;
    document.getElementById('dueDate').value = record.dueDate;
    document.getElementById('duration').value = record.duration;
    document.getElementById('tag').value = record.tag;
    document.getElementById('form-heading').textContent = 'Edit Event / Task';

    document.querySelector('a[href="#form-section"]').click();
  }

  function deleteRecord(id){
    if (confirm('Are you sure you want to delete this record?')){
        state.records = state.records.filter(r => r.id !== id);
        saveRecords(state.records);
        render();
    }
  }

  function updateDashboardStats(){
    const totalRecords = state.records.length;
    const totalDurationMins = state.records.reduce((sum,r) => sum + r.duration, 0);

    const tagCounts = {};
    state.records.forEach(r => {
        tagCounts[r.tag] = (tagCounts[r.tag] || 0) + 1;
    });
    let topTag = '-';
    let maxCount = 0;
    for (const [tag,count] of Object.entries(tagCounts)){
        if (count > maxCount){
            maxCount = count;
            topTag = tag;
        }
    }

    document.getElementById('stat-total').textContent = totalRecords;
    document.getElementById('stat-duration').textContent = state.unitInHours
    ? (totalDurationMins / 60).toFixed(1) + 'hrs'
    : totalDurationMins + 'mins';
    document.getElementById('stat-top-tag').textContent = topTag;

    const cap = state.durationCap;
    const diff = cap - totalDurationMins;
    const statusDisplay = document.getElementById('cap-status-display');
    const liveAnnounce = document.getElementById('cap-live-announcement');

    if (totalDurationMins <= cap) {
        const msg = `You are ${diff} mins under your weekly target.`;
        statusDisplay.textContent = msg;
        liveAnnounce.setAttribute('aria-live', 'polite');
        liveAnnounce.textContent = msg;
    }else{
        const msg = `Warning: You have exceeded your weekly target by ${Math.abs(diff)} mins!`;
        statusDisplay.textContent = msg;
        liveAnnounce.setAttribute('aria-live','assertive');
        liveAnnounce.textContent = msg;
    }
  }

  function exportJSON(){
    const dataStr = "data:text/json;charset=utf-8" + encodeURIComponent(JSON.stringify(state.records,null,4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "campus_planner_backup.json"); 
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function handleImportJSON(e){
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event){
        try {
            const imported = JSON.parse(event.target.result);
            if (validateImportData(imported)) {
                state.records = imported;
                saveRecords(state.records);
                render();
                alert('Data successfully imported!');
            }else{
                alert('Invalid JSON structure. Import failed.');
            }
        }catch(err){
            alert('Error parsing JSON file.');
        }
    };
    reader.readAsText(file);
  }