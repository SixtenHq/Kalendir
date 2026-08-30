import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
import { reloadCourseList, addToCalView } from "./front.js";
import * as dt from "./data.js";


async function loadCalFromSorce() {
    console.log("loadCalFromSorce")
    const CalSorceLink = document.getElementById("CalSorceTextfield").value;
    if (!CalSorceLink.includes("cloud.timeedit.net/liu/web/schema")) {
        console.log("fel sorce link!");
        return;
    }
    if (dt.CalSorcesIncludes(CalSorceLink)) {
        console.log("redan inlagd");
        return;
    }
    dt.addCalSorce(CalSorceLink);
    

    //hämta och skriv om Ical till lästligt format
    const response = await fetch(CalSorceLink);
    const data = await response.text();
    dt.setCal(ICAL.parse(data));
    updateCal();
    
}

export function updateCal() {
    const comps = new ICAL.Component(dt.getCal());
    const events = comps.getAllSubcomponents("vevent");
    format(events);
    reloadCourseList();
    addToCalView(events);
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


async function sendIcalToServer(icsText) {

    const response = await fetch("/worker", {
        method: "POST",
        body: icsText
    });

    const result = await response.text();

    console.log(result);
}



document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("LoadCalBtn").addEventListener("click", loadCalFromSorce);
});