import ICAL from "ical.js";
import * as dt from "./data.js";

let lastUpdate = 0;
let pausedAt = 0;
let pausedTime = 0;
let start
let countStart = 0;
let timeCount = 0;

function timeStart() {
    start = performance.now();
    pausedTime = 0;
}

function timeEnd() {
    const end = performance.now();
    console.log(`exec tog ${end - start - pausedTime} ms`);
}

function timePause() {
    pausedAt = performance.now();
}

function timeUnpause() {
    pausedTime += performance.now() - pausedAt;
}

function timeStartCount() {
    countStart = performance.now();
}

function timeStopCount() {
    timeCount += performance.now() - countStart;
}

function timeCountEnd() {
    console.log(`count ${timeCount} ms`);
    timeCount = 0;
}



export async function updateCal() {
    const now = Date.now();
    //if (now - lastUpdate >= 60 * 1000 || !dt.getIcs()) {
        await loadCalFromSorce();
        //lastUpdate = now;
    //}
    
    const comps = dt.getCal();
    const events = comps.getAllSubcomponents("vevent");
    
    format(events);
    dt.setCal(comps);

}

function makeIcs() {
    const calendar = new ICAL.Component("vcalendar");

    calendar.addPropertyWithValue("VERSION", "2.0");
    calendar.addPropertyWithValue("PRODID", "-//Kalendir//EN");
    calendar.addPropertyWithValue("CALSCALE", "GREGORIAN");
    calendar.addPropertyWithValue("X-WR-CALNAME", "Kalendir :D");
    calendar.addPropertyWithValue("X-WR-CALDESC", "Kalender redigerad av Kalendir");

    const ics = calendar.toString();
    dt.setIcs(ics);
}

async function loadCalFromSorce() {
    
    if (!dt.hasIcs()) {
        makeIcs();
    }

    dt.clearIcs();
    
    const excludeRules = prepareExcludeRules()
    const CalSorceLinks = dt.getCalSorces();
    let eventList = [];
    
    for (const link of CalSorceLinks) {
        // get calendar from TimeEdit
        
        const response = await fetch(link);
        const ics = await response.text();
        
        timeStartCount();
        const comps = new ICAL.Component(ICAL.parse(ics));
        const events = comps.getAllSubcomponents("vevent");
        timeStopCount();
        


        for (const e of events) {
            
            let include = true;
            if (excludeRules.length > 0) {
                
                const event = new ICAL.Event(e);
                
                
                
                const eventText = (event.description + event.summary).toLocaleLowerCase();
                
                for (const { rules, exceptions, ignored } of excludeRules) {
                    if (ignored) continue;
                    if (rules.some(rule => eventText.includes(rule)) && !exceptions.some(exeption => eventText.includes(exeption))) {
                        include = false;
                        break;
                    }
                }
                
                
            }
            

            if (include) {
                
                eventList.push(e);
                
            }
        } 
        
    }
    timeCountEnd();
    dt.addEvents(eventList);
    
}

function prepareExcludeRules() {
    const excludeRules = dt.getExcludeRules().map(([rules, exceptions, ignored]) => ({
        rules: rules.split(";")
            .map(rule => rule.trim().toLowerCase())
            .filter(Boolean),
        exceptions: exceptions.split(";")
            .map(exception => exception.trim().toLowerCase())
            .filter(Boolean),
        ignored
    }));
    return excludeRules;
}



function format(events) {

    for (let e of events) {
        const event = new ICAL.Event(e);
        if (!isEdited(event)) {
            event.description = "Orginal title: " + event.summary + "\n" + event.description;
        }
        event.summary = formatSummary(event);
    }
}

function formatSummary(event) {
    let descriptionParts = event.description.split("\n");
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
            let tempCourseName = part.slice(6).trim();
            
            let courseCode = summaryParts[i];
            let savedCourse = dt.gettSavedCourse(courseCode);
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
            type = part.slice(17).trim();
        }
    }

    if (courseName != "" && type != "") {
        return courseName + " " + type;
    } else {
        console.log("faild to make summary");
        return summaryParts.join(" ");
    }
        
}

function isEdited(event) {
    return event.description.startsWith("Orginal title: ");
}

