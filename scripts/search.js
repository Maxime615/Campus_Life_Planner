import { compileRegex } from "./validators.js";

export function filterRecords(records, searchInput, caseSensitive = false) {
    if (!searchInput) return records;

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = compileRegex(searchInput, flags);

    if (!regex) return records;

    filterRecords.__lastRegex = regex;

    return records.filter(record =>{
        return(
            regex.test(record.title) ||
            regex.test(record.tag) ||
            regex.test(record.dueDate) ||
            regex.test(String(record.duration))
        );
    });
 }

 export function highlightText(text, regex){
    if (!regex || !text) return text;
    return String(text).replace(regex, m => `<mark>${m}</mark>`);
 }