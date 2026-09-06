import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
import { updateCal } from "./calendar.js";
import * as dt from "./data.js";

let calendar;

async function reload() {
    await updateCal();
    reloadCourseList();
    updateCalView();
}


async function loadCalSorce() {
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
    
    reload();
}





// ------------------ kalender UI -------------------

// skapa kalendervisning
function createCalendar() {
    calendar = new FullCalendar.Calendar(
        document.getElementById("calendar"),
        {
            initialView: "timeGridWeek",
            slotMinTime: "06:00:00",
            //firstDay: 1,

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

function updateCalView() {
    calendar.removeAllEvents();
    const comps = dt.getCal();
    const events = comps.getAllSubcomponents("vevent");
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

function reloadCourseList() {
    const corseListContainer = document.getElementById("courseList");
    corseListContainer.innerHTML = "";

    for (const [courseCode, courseInfo] of Object.entries(dt.gettSavedCourses())) {
        const row = document.createElement("div");
        row.classList.add("courseRow")
        if (courseInfo.ignored) {
            row.classList.add("gray");
        }

        //lable
        const label = document.createElement("label");
        label.textContent = courseCode + ": "+ courseInfo.name;
        
        label.classList.add("lableSize");
        row.appendChild(label);

        //input fält
        const input = document.createElement("input");
        input.type = "text";
        if (courseInfo.customName) {
            input.value = courseInfo.customName;
        } 
        input.placeholder = "Eget namn"
        input.classList.add("kursRuta");
        input.id = "input" + courseCode;

        row.appendChild(input);

        //knapp
        const button = document.createElement("button");
        
        button.id = "button" + courseCode;
        button.addEventListener("click", () => {
            ignoreCourse(courseCode, row);
        });
        if (courseInfo.ignored){
            button.textContent = "Min kurs";
        } else {
            button.textContent = "Inte min kurs";
        }

        row.appendChild(button);
        
        corseListContainer.appendChild(row);
    }
}

function ignoreCourse(courseCode) {
    var course = dt.gettSavedCourse(courseCode);
    if (course.ignored){
        course.ignored = false;
    } else {
        course.ignored = true;
    }
    reload();
}


document.addEventListener("DOMContentLoaded", () => {
    createCalendar();

    const corseListContainer = document.getElementById("courseList");
    corseListContainer.addEventListener("change", (event) => {
        if (event.target.id.startsWith("input")) {
            const course = dt.gettSavedCourses()[event.target.id.slice(5)]
            if (course) {
                course.customName = event.target.value;
                reload();
            }
        } else if (event.target.id.startsWith("button")) {

        }
        
    });
    document.getElementById("LoadCalBtn").addEventListener("click", loadCalSorce);
});