import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";

let calendar;
let courseCodeToName;

// skapa kalendervisning
function createCalendar() {
    calendar = new FullCalendar.Calendar(
        document.getElementById("calendar"),
        {
            initialView: "timeGridWeek",

            eventClick: function(info) {

                if (info.event.extendedProps.selected) {
                    info.event.setProp("backgroundColor", "");
                    info.event.setProp("borderColor", "");
                
                    info.event.setExtendedProp("selected", false);
                } else {
                    info.event.setProp("backgroundColor", "gray");
                    info.event.setProp("borderColor", "gray");
                
                    info.event.setExtendedProp("selected", true);
                }
            
            }           
        }
    );

    calendar.render();
}


async function loadCalFromSorce() {
    console.log("loadCalFromSorce")
    const CalSorceLink = document.getElementById("CalSorceTextfield").value;
    if (!CalSorceLink.includes("cloud.timeedit.net/liu/web/schema")) {
        console.log("fel sorce link!");
        return;
    }

    //hämta och skriv om Ical till lästligt format
    const response = await fetch(CalSorceLink);
    const data = await response.text();
    const jcalData = ICAL.parse(data);
    const comps = new ICAL.Component(jcalData);
    const events = comps.getAllSubcomponents("vevent");

    format(events);
    addToCalView(events);
}

function format(events) {

    for (var e of events) {
        const event = new ICAL.Event(e);
        event.description = event.summary + "\n" + event.description;
        event.summary = formatSummary(event);
    }
}

function formatSummary(event) {
    var summaryParts = event.summary.split(", ");
    var descriptionParts = event.description.split("\n");
    
    var course = "";
    var type = "";

    var i = 0;
    for (const part of descriptionParts) {
        if (part.startsWith("Kurs: ")) {
            summaryParts[i] 
            course = part.slice(6).trim();
        }else if (part.startsWith("Undervisningstyp: ")) {
            type = part.slice(17).trim();
        }
    }

    if (course != "" && type != "") {
        return course + " " + type;
    } else {
        console.log("faild to make summary");
        return event.summary
    }
        
}



function addToCalView(events) {
    for (var e of events) {
        const event = new ICAL.Event(e);

        calendar.addEvent({
            title: event.summary,
            start: event.startDate.toJSDate(),
            end: event.endDate.toJSDate(),
            extendedProps: {
                originalEvent: event
            }
        });

    }
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
    createCalendar();
    document.getElementById("LoadCalBtn").addEventListener("click", loadCalFromSorce);
    document.getElementById("testBtn").addEventListener("click", test);
});

async function test() {
    const response = await fetch("https://liutentor.lukasabbe.com/api/courses/TDDE35");

    const data = await response.json();

    console.log(data);

}
//https://cloud.timeedit.net/liu/web/schema/ri67Z146X55Z09Q6Z56g2Y00y6026Y02n00gQY6Q537610Q13.ics