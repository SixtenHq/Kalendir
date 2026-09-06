import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
import * as dt from "./data.js";


export async function updateCal() {
    await loadCalFromSorce();

    const comps = dt.getCal();
    const events = comps.getAllSubcomponents("vevent");
    
    format(events);
    dt.setCal(comps);
}

function makeIcs() {
    const calendar = new ICAL.Component("vcalendar");

    calendar.addPropertyWithValue("version", "2.0");
    calendar.addPropertyWithValue("prodid", "-//Mitt Program//EN");


    
}

async function loadCalFromSorce() {
    if (!dt.hasIcs) {
        //makeIcs();
    }
    const CalSorceLinks = dt.getCalSorces();

    for (const link of CalSorceLinks) {
        const response = await fetch(link);
        const ics = await response.text();
        
        if (dt.hasIcs()) {
            const newcomps = new ICAL.Component(ICAL.parse(ics));
            const newEvents = newcomps.getAllSubcomponents("vevent");
            for (const newEvent of newEvents) {
                dt.getCal().addSubcomponent(newEvent);
            } 
        } else {
            dt.setIcs(ics);
        }
    }
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

