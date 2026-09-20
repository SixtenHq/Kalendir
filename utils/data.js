import ical from "ical-generator";

let sessionData = 
{
    id: null,
    CalSorces: [],
    savedCourses: {
        // code:
        //      name: 
        //      customName: 
        //      ignored:
        },
    excludeRules: [
        // [matchText, ignoreText, isIgnored]
        //["ruleEX", "exeptionEX", false],
        ],
    calHeader: {
        prodId: "-//Kalendir//EN",
        scale: "GREGORIAN",
        name: "Kalendir :D",
        description: "Kalender redigerad av Kalendir"
    },
    calEvents: new Map(),
    calPreservedEvents: new Map(),
};

export function exportData() {
    let tempSessionData = structuredClone(sessionData);
    tempSessionData.calEvents = Array.from(sessionData.calEvents);
    tempSessionData.calPreservedEvents = Array.from(sessionData.calPreservedEvents);
    return JSON.stringify(tempSessionData);
}

export function importData(importedData) {
    let tempSessionData = structuredClone(importedData);

    tempSessionData.calEvents = new Map(importedData.calEvents);
    for (const [id, event] of tempSessionData.calEvents) {
        event.start = new Date(event.start);
        event.end = new Date(event.end);
        event.stamp = new Date(event.stamp);
        event.lastModified = new Date(event.lastModified);
    }
    tempSessionData.calPreservedEvents = new Map(importedData.calPreservedEvents);
    for (const [id, event] of tempSessionData.calPreservedEvents) {
        event.start = new Date(event.start);
        event.end = new Date(event.end);
        event.stamp = new Date(event.stamp);
        event.lastModified = new Date(event.lastModified);
    }

    // fixa data från gamla veriationer
    if (tempSessionData.CalSorces == undefined) tempSessionData.CalSorces = sessionData.CalSorces;
    if (tempSessionData.savedCourses == undefined) tempSessionData.savedCourses = sessionData.savedCourses;
    if (tempSessionData.excludeRules == undefined) tempSessionData.excludeRules = sessionData.excludeRules;
    sessionData = tempSessionData;
}

export function DataToString() {
    //console.log(sessionData.calEvents.values().next().value);
    return "id: " + sessionData.id + "\n" + "cal sorces: " + sessionData.CalSorces + "\n" + "saved corses: " + sessionData.savedCourses + "\n" + "excluderules: " + sessionData.excludeRules + "\n" + "number of events: " + sessionData.calEvents.size;
}

export function getIcs() {
    const ics = ical(sessionData.calHeader);
    for (const [id, event] of sessionData.calEvents) {
        ics.createEvent(event);
    }
    for (const [id, event] of sessionData.calPreservedEvents) {
        ics.createEvent(event);
    }
    return ics;
}

export function getIcsEvents() {
    const ics = ical(sessionData.calHeader);
    const icsEvents = [];
    for (const [id, event] of sessionData.calEvents) {
        icsEvents.push(ics.createEvent(event))
    }
    for (const [id, event] of sessionData.calPreservedEvents) {
        icsEvents.push(ics.createEvent(event))
    }
    
    return icsEvents;
}

//-----
export function getId() {
    return sessionData.id;
}

export function setId(newId) {
    sessionData.id = newId;
}
//-----
export function getEvents() {
    return sessionData.calEvents;
}

export function setEvents(events) {
    sessionData.calEvents = events;
}

//-----
export function getPreservedEvents() {
    return sessionData.calPreservedEvents;
}

export function setPreservedEvents(events) {
    sessionData.calPreservedEvents = events;
}

//-----
export function setHeader(header) {
    sessionData.calHeader = header;
}

export function getHeader() {
    return sessionData.calHeader;
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

export function getDeformattedExcludeRules() {
    const excludeRules = sessionData.excludeRules.map(([matchText, ignoreText, isIgnored]) => ({
        matchText: matchText.trim().toLowerCase(),
        ignoreText: ignoreText.trim().toLowerCase(),
        isIgnored
    }));
    return excludeRules;
}

export function addExcludeRule(matchText, ignoreText = "") {
    sessionData.excludeRules.push([matchText,ignoreText,false]);
}

export function removeExcludeRule(i) {
    sessionData.excludeRules.splice(i,1);
}

export function setExcludeRule(i, input) {
    sessionData.excludeRules[i] = input;
}