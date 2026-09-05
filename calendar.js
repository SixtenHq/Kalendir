import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
import * as dt from "./data.js";

export async function loadCalFromSorce() {
    const CalSorceLinks = dt.getCalSorces();

    for (const link in CalSorceLinks) {
        const response = await fetch(link);
        const ics = await response.text();
        dt.addIcs(ics);
    }
    
}

export function updateCal() {
    const comps = dt.getCal();
    const events = comps.getAllSubcomponents("vevent");
    format(events);
    reloadCourseList();
    addToCalView(events);
    dt.setCal(comps);
}

function format(events) {

    for (var e of events) {
        const event = new ICAL.Event(e);
        if (!isEdited(event)) {
            event.description = "Orginal title: " + event.summary + "\n" + event.description;
        }
        event.summary = formatSummary(event);
    }
}

function formatSummary(event) {
    var descriptionParts = event.description.split("\n");
    let summaryParts;
    if (isEdited(event)) {
        summaryParts = descriptionParts[0].slice(15).split(", ");
    } else {
        summaryParts = event.summary.split(", ");
    }
    
    
    var courseName = "";
    var type = "";

    var i = 0;
    for (const part of descriptionParts) {
        if (part.startsWith("Kurs: ")) {
            courseName = part.slice(6).trim();
            
            var courseCode = summaryParts[i];
            var savedCourse = dt.gettSavedCourse(courseCode);

            if (savedCourse && savedCourse.customName) {
                courseName = savedCourse.customName;
            } else if (savedCourse) {
                courseName = savedCourse.name;
            } else {
                dt.addSavedCourse(courseCode,courseName);
            }
            i++;

        }else if (part.startsWith("Undervisningstyp: ")) {
            type = part.slice(17).trim();
        }
    }

    if (courseName != "" && type != "") {
        return courseName + " " + type;
    } else {
        console.log("faild to make summary");
        console.log(dt.gettSavedCourses());
        return event.summary
    }
        
}

function isEdited(event) {
    return event.description.startsWith("Orginal title: ");
}