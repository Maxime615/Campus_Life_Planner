const STORAGE_KEY = 'campus_planner:data';

export async function loadRecords(){
    try{
        const localData = localStorage.getItem(STORAGE_KEY);
        if(localData){
            return JSON.parse(localData)
        }

        const response = await fetch('./assets/seed.json');
        if(!response.ok){
            throw new Error('failed to load seed data.')
        }
        const seedData = await response.json();
        saveRecords(seedData);
        return seedData;
        }catch (error){
            console.error('Error loading records:', error);
            return [];
        }
}

export function saveRecords(records){
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }catch(error){
        console.error('Error saving records to localStorage', error);
    }
}

export function validateImportData(data){
    if(!Array.isArray(data)) return false;

    return data.every(item =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&    
        typeof item.dueDate === 'string' &&
        typeof item.duration === 'number' &&
        typeof item.tag === 'string'
    );
}