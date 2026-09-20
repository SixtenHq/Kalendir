import * as dt from "./data.js";
import * as time from "./time.js";
import { parceIcs } from "./icalParcer.js";


export async function updateCal() {
    time.start();
    await importCal();
    console.log("import\n" + dt.DataToString());
    filterCal();
    console.log("filter\n" + dt.DataToString());
    format();
    console.log("format\n" + dt.DataToString());
    time.end();
}

async function importCal() {
    
    const CalSorceLinks = dt.getCalSorces();
    const savedEvents = dt.getEvents();
    const newEventList = new Map();
    const preservedEvents = dt.getPreservedEvents();
    
    //import new events
    for (const link of CalSorceLinks) {
        time.pause();
        const response = await fetch(link);
        const ics = await response.text();
        time.unpause();
        let importedEvents = parceIcs(ics);
        

        for (const impEvent of importedEvents) {            
            const id = impEvent.id;
            const savedEvent = savedEvents.get(id);
            
            if (!savedEvent || impEvent.lastModified < savedEvent.lastModified) {
                newEventList.set(id, impEvent);
                savedEvents.delete(id);
            } 
        } 
    }    
    // spara gamla event
    const currentTime = Date.now();
    for (const event of savedEvents) {
        if (!newEventList.get(event.id) && event.start < currentTime) {
            preservedEvents.set(event.id, event);
        }
    }
    dt.setEvents(newEventList);
}

function filterCal(){
    const cal = dt.getEvents();
    const rules = dt.getDeformattedExcludeRules();
    for (const rule of rules) {
        if (!rule.ignored) {
            for (const event of cal.values()) {
                const eventText = (event.description + event.summary).toLocaleLowerCase();
                
                if (eventText.includes(rule.rules) && !eventText.includes(rule.exeptions)){
                    cal.delete(event.id);
                }
            }
        }
    }
}

function format() {
    const events = dt.getEvents();
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
            let tempCourseName = part.slice(6).trim(); // get name
            const courseCode = summaryParts[i]; // get coresponding corse code
            const savedCourse = dt.gettSavedCourse(courseCode);
            if (savedCourse && savedCourse.customName) {
                tempCourseName = savedCourse.customName;
            } else if (savedCourse) {
                tempCourseName = savedCourse.name;
            } else {
                dt.addSavedCourse(courseCode,tempCourseName);
            }

            if ((savedCourse && !savedCourse.ignored) || !savedCourse) {
                courseName = tempCourseName;
            }
            
            i++;

        } else if (part.startsWith("Undervisningstyp: ")) {
            type = part.slice(17).trim(); // get type
        }
    }

    if (courseName != "" && type != "") {
        event.summary = courseName + " " + type;
    } else {
        console.log("faild to make summary");
        event.summary = summaryParts.join(" ");
    }       
}

function isEdited(event) {
    return event.description.startsWith("Orginal title: ");
}
