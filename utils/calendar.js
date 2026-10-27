import * as dt from "./data.js";
import * as time from "./time.js";
import { parceIcs } from "./icalParcer.js";


export async function updateCal(doImport, isServer = false) {
    time.start();
    if (doImport) await importCal();
    filterCal(isServer);
    format(isServer);
    time.end();
    
}

async function importCal() {
    
    const sorces = dt.getSorces();
    const savedEvents = dt.getFutureEvents();
    const newEventList = new Map();
    const pastEvents = dt.getPastEvents();
    
    //import new events
    for (const link of sorces) {
        time.pause();
        const response = await fetch(link);
        const ics = await response.text();
        time.unpause();
        
        let importedEvents = parceIcs(ics);

        for (const impEvent of importedEvents) {            
            const id = impEvent.id;
            const savedEvent = savedEvents.get(id);
            
            if (!savedEvent || impEvent.lastModified > savedEvent.lastModified) { //if not saved OR modefied since last save
                newEventList.set(id, impEvent);
                savedEvents.delete(id);
            } else {
                newEventList.set(id, savedEvent);
                savedEvents.delete(id);
            }
        } 
    }    
    // spara gamla event
    const currentTime = Date.now();
    for (const event of savedEvents) {
        if (!newEventList.get(event.id) && event.start < currentTime) {
            pastEvents.set(event.id, event);
        }
    }
    dt.setFutureEvents(newEventList);
}

function filterCal(isServer){
    const events = dt.getEvents(isServer);
    let remainingEvents  = structuredClone(events);
    const categories = dt.getCategories();
    for (const categorie of categories) {
        const rules = dt.getDeformattedRules(categorie.index);
        for (const rule of rules) {
            if (rule.matchText != "") {
                for (const event of remainingEvents.values()) {
                    const eventText = (event.description + event.summary).toLocaleLowerCase();

                    if (eventText.includes(rule.matchText) && !eventText.includes(rule.ignoreText)){
                        remainingEvents.delete(event.id);
                        events.get(event.id).categorie = categorie.index;
                    } else {
                        events.get(event.id).categorie = 0;
                    }
                }
            }
        }
    }
}

function format(isServer) {
    const events = dt.getEvents(isServer);
    for (let [id, event] of events) {
        if (!isEdited(event)) {
            event.description = "Orginal title: " + event.summary + "\n" + event.description;
        }
        formatSummary(event);
    }
}

function formatSummary(event) {
    const descriptionParts = event.description.split("\n");
    let summaryParts;
    if (isEdited(event)) {
        summaryParts = descriptionParts[0].slice(15).split(", "); // get original titel insted of edited
    } else {
        summaryParts = event.summary.split(", ");
    }
    
    let courseName = "";
    let type = "";

    let i = 0;
    for (const part of descriptionParts) {
        if (part.startsWith("Kurs: ")) {
            const courseCode = summaryParts[i]; // get coresponding corse code
            const savedCourse = dt.getCourse(courseCode);
            if (savedCourse) {
                if (savedCourse.ignored) {
                    i++;
                    continue;
                } else if (savedCourse.customName != undefined){
                    courseName = savedCourse.customName;
                } else {
                    courseName = savedCourse.name;
                }
            } else {
                courseName = part.slice(6).trim(); // get name
                dt.addCourse(courseCode, courseName);
            }
            i++;
        } else if (part.startsWith("Undervisningstyp: ")) {
            type = part.slice(17).trim(); // get type
        }
    }

    if (courseName != "" && type != "") {
        event.summary = courseName + " " + type;
    } else {
        console.log("faild to make summary: " + courseName + ", " + type);
        //console.log(event.description);
        //console.log(descriptionParts);
        event.summary = summaryParts.join(" ");
    }       
}

function isEdited(event) {
    return event.description.startsWith("Orginal title: ");
}
