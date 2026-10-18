import { highlightText} from "./search.js";

export function renderTableRows(tbody,records,regex,uniHours,onEdit,onDelete){
    tbody.innerHTML = '';

    if (records.length === 0){
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No records found.</td></tr>`;
        return;
    }

    records.forEach(record =>{
        const tr = document.createElement('tr');

        const displayDuration = unitInHours
        ? (record.duration / 60).toFixed(1) + 'hrs'
        : record.duration + 'mins';

        tr.innerHTML = `<td>${highlightText(record.title, regex)}</td>
            <td>${highlightText(record.dueDate, regex)}</td>
            <td>${highlightText(displayDuration, regex)}</td>
            <td>${highlightText(record.tag, regex)}</td>
            <td>
                <button class="edit-btn" data-id="${record.id}">Edit</button>
                <button class="delete-btn" data-id="${record.id}">Delete</button>
            </td>`;
            tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.edit-btn').forEach(btn =>{
        btn.addEventListener('click', () => onEdit(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn =>{
        btn.addEventListener('click', () => onDelete(btn.dataset.id));
    });
}

export function updateDashboard(records, durationCap , unitInHours){
    const totalRecords = record.length;
    const totalDurationMins = records.reduce((sum, r) => sum + r.duration, 0);

    const tagCounts = {};
    records.forEach(r => {
        tagCounts[r.tag] = (tagCounts[r.tag] || 0) + 1;
    });
    let topTag = '-';
    let maxCount = 0;
    for (const [tag, count] of Object.entries(tagCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topTag = tag;
        }
    }

    document.getElementById('stat-total').textContent = totalRecords;
    document.getElementById('stat-duration').textContent = unitInHours 
        ? (totalDurationMins / 60).toFixed(1) + ' hrs' 
        : totalDurationMins + ' mins';
    document.getElementById('stat-top-tag').textContent = topTag;

    const diff = durationCap - totalDurationMins;
    const statusDisplay = document.getElementById('cap-status-display');
    const liveAnnounce = document.getElementById('cap-live-announcemet');

    if (totalDurationMins <= durationCap) {
        const msg = `You are ${diff} mins under your weekly target.`;
        statusDisplay.textContent = msg;
        liveAnnounce.setAttribute('aria-live', 'polite');
        liveAnnounce.textContent = msg;
    }else{
        const msg = 'Warning: You have exceeded your weekly target by ${Math.abs(diff)} mins!';
        statusDisplay.textContent = msg;
        liveAnnounce.setAttribute('aria-live', 'assertive');
        liveAnnounce.textContent = msg;
    }
}
