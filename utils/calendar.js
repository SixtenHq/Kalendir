import ICAL from "ical.js";
import * as dt from "./data.js";


export async function updateCal() {
    await loadCalFromSorce();
    console.log(dt.DataToString());
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

    const CalSorceLinks = dt.getCalSorces();
    for (const link of CalSorceLinks) {
        const response = await fetch(link);
        const ics = await response.text();
        
        const comps = new ICAL.Component(ICAL.parse(ics));
        const events = comps.getAllSubcomponents("vevent");
        for (const e of events) {
            const event = new ICAL.Event(e);
            let include = true;
            if (dt.getExcludeRules()[0]) {
                for (const [rules, exeptions, ignored] of dt.getExcludeRules()) {
                    if (ignored) continue;

                    let rulesList = rules.split(";")
                    let exeptionsList = exeptions.split(";")

                    if (rulesList.some(rule => event.description.toLowerCase().includes(rule.toLowerCase()) && rule.trim() != "") ||
                        rulesList.some(rule => event.summary.toLowerCase().includes(rule.toLowerCase()) && rule.trim() != "")) 
                        {
                            if (!(exeptionsList.some(exeption => event.description.toLowerCase().includes(exeption.toLowerCase()) && exeption.trim() != "") ||
                            exeptionsList.some(exeption => event.summary.toLowerCase().includes(exeption.toLowerCase()) && exeption.trim() != ""))) 
                            {
                                include = false;
                                break;
                        }
                    }
                }
            }
            if (include) {
                dt.addEvent(e);
            }
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

