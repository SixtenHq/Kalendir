import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";

var sessionData = 
{
    id: null,
    ics: null,
    CalSorces: [],
    savedCourses: {
        // code:
        //      name: 
        //      customName: 
        },
};

export function exportData() {
    return JSON.stringify(sessionData);
}

export function importData(importedData) {
    sessionData = importedData;
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

export function setIcs(newIcs) {
    sessionData.ics = newIcs;
}

export function addIcs(newIcs) {
    if (!sessionData.ics) {
       const newcomps = ICAL.Component(ICAL.parse(newIcs));
        const newEvents = newcomps.getAllSubcomponents("vevent");
        for (const newEvent of newEvents) {
            ICAL.Component(ICAL.parse(sessionData.ics)).addSubcomponent(newEvent);
        } 
    } else {
        sessionData.ics = newIcs;
    }
    
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
        name: name
    };
}
//-----
