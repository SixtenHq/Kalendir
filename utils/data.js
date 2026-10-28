import ical from "ical-generator";

const header =
{
    prodId: "-//Kalendir//EN",
    scale: "GREGORIAN",
    name: "Kalendir :D",
    description: "Kalender redigerad av Kalendir"
};

let sessionData =
{
    userId: null,
    sorces: [
        //link:
        //time:
    ],
    courses: {
        // code: {
        //      name: 
        //      customName: 
        //      ignored:
        // }
    },
    futureEvents: new Map(),
    pastEvents: new Map(),
    subLinks: [],
    categories: [
        {
            index: 0,
            name: "hidden",
            colour: "gray",
            rules: [{
                matchText: "objekt",
                ignoreText: "",
            }]
        },
        {
            index: 1,
            name: "default",
            colour: "",
            rules: [{
                matchText: "",
                ignoreText: "",
            }]
        }
    ],
    email: ""
};

export function exportData() {
    let tempSessionData = structuredClone(sessionData);
    tempSessionData.futureEvents = Array.from(sessionData.futureEvents);
    tempSessionData.pastEvents = Array.from(sessionData.pastEvents);
    return JSON.stringify(tempSessionData);
}

export function importData(importedData) {
    let tempSessionData = structuredClone(importedData);

    tempSessionData.futureEvents = new Map(importedData.futureEvents);
    for (const [id, event] of tempSessionData.futureEvents) {
        event.start = new Date(event.start);
        event.end = new Date(event.end);
        event.stamp = new Date(event.stamp);
        event.lastModified = new Date(event.lastModified);
    }
    tempSessionData.pastEvents = new Map(importedData.pastEvents);
    for (const [id, event] of tempSessionData.pastEvents) {
        event.start = new Date(event.start);
        event.end = new Date(event.end);
        event.stamp = new Date(event.stamp);
        event.lastModified = new Date(event.lastModified);
    }

    sessionData = tempSessionData;
}

export function getIcs(categorieIndex) {
    const categorie = sessionData.categories[categorieIndex];

    tempHeader = structuredClone(header);
    tempHeader.name = categorie.name;
    const ics = ical(tempHeader);

    const events = getEvents(false);
    for (const [id, event] of events) {
        if (event.categorie == categorieIndex) {
            ics.createEvent(event);
        }
    }
    return ics;
}

// ---------- UserId ----------
export function getUserId() {
    return sessionData.userId;
}

export function setUserId(newId) {
    sessionData.userId = newId;
}

// ---------- Events ----------
export function getEvents(isServer) {
    if (isServer) {
        return sessionData.futureEvents;
    } else {
        return new Map([...sessionData.futureEvents, ...sessionData.pastEvents]);
    }
}

export function getFutureEvents() {
    return sessionData.futureEvents;
}

export function getPastEvents() {
    return sessionData.pastEvents;
}

export function setFutureEvents(events) {
    sessionData.futureEvents = events;
}

export function setPastEvents(events) {
    sessionData.pastEvents = events;
}


// ----------------- subscriptionLinks --------------
export function makeSubLinks() {
    if (!sessionData.id) {
        setUserId(crypto.randomUUID());
    }

    sessionData.subLinks = [];
    for (const categorie of sessionData.categories){
        const url = new URL("https://kalendir.pages.dev/import");
        url.searchParams.set("categorie", categorie.index + categorie.name);
        url.searchParams.set("id", getUserId());
        sessionData.subLinks.push(url.toString());
    }
}

export function getSubLink(i) {
    for (const sublink of sessionData.subLinks) {
        if (sublink.includes("categorie=" + i)) return sublink;
    }
    return null;
}


// ---------- Sorces ----------
export function getSorces() {
    return sessionData.sorces;
}

export function addSorce(source, date) {
    sessionData.sorces.push({
        link: source,
        time: date
    });
}

export function sorcesIncludes(insource) {
    for (const sorce of sessionData.sorces) {
        if (sorce.link == insource) return true;
    }
    return false;
}

export function removeSorce(i) {
    sessionData.sorces.splice(i, 1);
}

// ---------- Courses ----------
export function getCourses() {
    return sessionData.courses;
}

export function getCourse(courseCode) {
    return sessionData.courses[courseCode];
}

export function addCourse(courseCode, name) {
    sessionData.courses[courseCode] = {
        name: name,
        ignored: false
    };
}

export function removeCourse(courseCode) {
    delete sessionData.courses[courseCode];
}

// ---------- Categories ----------
export function getCategories() {
    return sessionData.categories;
}

export function newCategorie() {
    const size = sessionData.categories.length;
    sessionData.categories.push({
        index: size,
        name: "",
        colour: "",
        rules: [{
            matchText: "",
            ignoreText: "",
        }]
    });
}

export function removeCategorie(i) {
    sessionData.categories.splice(i, 1);
}

export function setCategorieName(catagory, name) {
    sessionData.categories[catagory].name = name;
}

export function setCategorieColour(catagory, colour) {
    sessionData.categories[catagory].colour = colour;
}

// ---------- Categories/Rules ----------
export function getRules(catagory) {
    return sessionData.categories[catagory].rules;
}

export function getDeformattedRules(catagory) {
    const rules = sessionData.categories[catagory].rules.map((rule) => ({
        matchText: rule.matchText.trim().toLowerCase(),
        ignoreText: rule.ignoreText.trim().toLowerCase(),
    }));
    return rules;
}

export function addRule(catagory, matchText, ignoreText) {
    sessionData.categories[catagory].rules.push({
        matchText: matchText,
        ignoreText: ignoreText
    });
}

export function setRule(catagory, i, matchText, ignoreText) {
    sessionData.categories[catagory].rules[i] = {
        matchText: matchText,
        ignoreText: ignoreText
    };
}

export function removeRule(catagory,i) {
    sessionData.categories[catagory].rules.splice(i, 1);
}


