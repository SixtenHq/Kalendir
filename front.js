import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
import { savedCourses, updateCal } from "./script.js";

let calendar;

// ------------------ kalender UI -------------------

// skapa kalendervisning
function createCalendar() {
    calendar = new FullCalendar.Calendar(
        document.getElementById("calendar"),
        {
            initialView: "timeGridWeek",
            slotMinTime: "06:00:00",

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

export function addToCalView(events) {
    calendar.removeAllEvents();
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

// ------------------ Curslistan -------------------

export function reloadCourseList() {
    const corseListContainer = document.getElementById("courseList");
    corseListContainer.innerHTML = "";

    for (const [courseCode, courseName] of Object.entries(savedCourses)) {
        const row = document.createElement("div");
        row.classList.add("courseRow")

        //lable
        const label = document.createElement("label");
        label.textContent = courseCode + ": "+ courseName.name;
        
        label.classList.add("lableSize");
        row.appendChild(label);

        //input fält
        const input = document.createElement("input");
        input.type = "text";
        if (courseName.customName) {
            input.value = courseName.customName;
        } 
        input.placeholder = "Eget namn"
        input.classList.add("kursRuta");
        input.id = "input" + courseCode;

        row.appendChild(input);

        //knapp
        const button = document.createElement("button");
        button.textContent = "Inte min kurs";
        button.id = "button" + courseCode;

        row.appendChild(button);
        
        corseListContainer.appendChild(row);
    }
}




document.addEventListener("DOMContentLoaded", () => {
    createCalendar();

    const corseListContainer = document.getElementById("courseList");
    corseListContainer.addEventListener("change", (event) => {
        if (event.target.id.startsWith("Input")) {
            const course = savedCourses[event.target.id.slice(5)]
            if (course) {
                course.customName = event.target.value;
                updateCal();
            }
        } else if (event.target.id.startsWith("button")) {

        }
        
    });
});