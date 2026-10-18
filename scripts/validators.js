export function validateTitle(title){
    if (!title || typeof title !== 'string') return {valid: false, message: 'Title cannot be empty.'};
    if (/^\s|\s$/.test(title) || /\s{2,}/.test(title)){
        return{valid: false, message: 'Title cannot have leading/trailing spaces.'}
    }   
    return {valid:true, message:''};
}

export function validateDuration(duration) {
    const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
    const strVal = String(duration).trim();
    if (!pattern.test(strVal) || Number(strVal) < 0) {
        return { valid: false, message: 'Duration must be a valid positive number.'};
    }
    return {valid: true, message:''};
}

export function validateDate(dateStr) {
    const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!pattern.test(dateStr)) {
        return { valid: false, message: 'Date must be in YYYY-MM-DD format.' };
    }
    return { valid: true, message: '' };
}

export function validateTag(tag) {
    const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    if (!pattern.test(tag)) {
        return { valid: false, message: 'Tag must contain only letters, spaces, or hyphens.' };
    }
    return { valid: true, message: '' };
}

export function hasDuplicateWords(text) {
    const advancedPattern = /\b(\w+)\s+\1\b/i;
    return advancedPattern.test(text);
}

export function compileRegex(input, flags = 'i') {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch {
        return null;
    }
}