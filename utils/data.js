import ICAL from "ical.js";

var sessionData = 
{
    id: null,
    ics: null,
    CalSorces: [],
    savedCourses: {
        // code:
        //      name: 
        //      customName: 
        //      ignored:
        },
    excludeRules: [
        // [rule, exeption, ignored]
        //["ruleEX", "exeptionEX", false],
        ],
    
    calHeader: null,
    calEvents: [],
};

export function exportData() {
    return JSON.stringify(sessionData);
}

export function importData(importedData) {
    sessionData = importedData;
    // fixa data från gamla veriationer
    if (sessionData.CalSorces == undefined) sessionData.CalSorces = [];
    if (sessionData.savedCourses == undefined) sessionData.savedCourses = {};
    if (sessionData.excludeRules == undefined) sessionData.excludeRules = [];
}

export function DataToString() {
    return sessionData.id + "\n" + sessionData.CalSorces + "\n" + sessionData.savedCourses + "\n" + sessionData.excludeRules + "\n" + sessionData.ics;
}

//-----
export function getId() {
    return sessionData.id;
}

export function setId(newId) {
    sessionData.id = newId;
}
//-----
export function getCal() {
    return new ICAL.Component(ICAL.parse(sessionData.ics));
}

export function setCal(newCal) {
    sessionData.ics = newCal.toString();
}

export function addEvent(event) {
    const cal = getCal();
    cal.addSubcomponent(event);
    setCal(cal);
}

export function addEvents(events) {
    const cal = getCal();
    for (const event of events) {
        cal.addSubcomponent(event);
    }
    setCal(cal);
}

export function setIcs(newIcs) {
    sessionData.ics = newIcs;
}

export function getIcs() {
    return sessionData.ics;
}

export function hasIcs() {
    return (false || (sessionData.ics))
}

export function clearIcs() {
    const cal = getCal();
    const events = cal.getAllSubcomponents("vevent");
    for (const event of events) {
        cal.removeSubcomponent(event);
    }
    setCal(cal);
}
//-----
export function getCalSorces() {
    return sessionData.CalSorces;
}

export function addCalSorce(source) {
    sessionData.CalSorces.push(source);
}

export function CalSorcesIncludes(source) {
    return sessionData.CalSorces.includes(source);
}
//-----
export function gettSavedCourses() {
    return sessionData.savedCourses;
}

export function gettSavedCourse(courseCode) {
    return sessionData.savedCourses[courseCode];
}

export function addSavedCourse(courseCode, name) {
    sessionData.savedCourses[courseCode] = {
        name: name,
        ignored: false
    };
}
//-----
export function getExcludeRules() {
    return sessionData.excludeRules;
}

export function addExcludeRule(rule, exeption = "") {
    sessionData.excludeRules.push([rule,exeption,false]);
}

export function removeExcludeRule(i) {
    sessionData.excludeRules.splice(importData,1);
}

export function setExcludeRule(i, input) {
    sessionData.excludeRules[i] = input;
}