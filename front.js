import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
import { updateCal } from "./calendar.js";
import * as dt from "./data.js";

let calendar;

export async function reload() {
    await updateCal();
    reloadCourseList();
    reloadRulesList()
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

                const state = ((info.event.extendedProps.state ?? 0) + 1) % 3;

                switch (state) {
                    case 0:
                        info.event.setProp("backgroundColor", "");
                        info.event.setProp("borderColor", "");
                        break;
                
                    case 1:
                        info.event.setProp("backgroundColor", "gray");
                        info.event.setProp("borderColor", "gray");
                        break;
                
                    case 2:
                        info.event.setProp("backgroundColor", "red");
                        info.event.setProp("borderColor", "red");
                        break;
                }

                info.event.setExtendedProp("state", state);
            
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
            ignoreCourse(courseCode);
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

// ------------------ Rules -------------------

function reloadRulesList() {
    const RulesListContainer = document.getElementById("rulesList");
    RulesListContainer.innerHTML = "";
    
    let rules = dt.getExcludeRules();
    if (!rules || !rules[0]) {
        dt.addExcludeRule("","",false);
    }
    if (rules[rules.length - 1][0].trim() != "") {
        dt.addExcludeRule("","",false);
    }
    
    

    let index = 0;
    for (const [rule, exeption, ignored] of dt.getExcludeRules()) {
        if (rule.trim() == "" && exeption.trim() == "" && index != rules.length - 1) {
            dt.removeExcludeRule(index);
            continue;
        }
        const i = index;
        const row = document.createElement("div");
        row.classList.add("courseRow")
        if (ignored) {
            row.classList.add("gray");
        }

        //lable
        const label = document.createElement("label");
        label.textContent = "Exclude if contains:";
        label.classList.add("lableSize");
        row.appendChild(label);

        //input fält
        const input = document.createElement("input");
        input.type = "text";
        input.value = rule;
        input.classList.add("kursRuta");
        input.id = "ruleInput" + i;
        input.addEventListener("change", (event) => {
            let newRule = [event.target.value, exeption, ignored];
            dt.setExcludeRule(i,newRule);
            reload();
        });
        row.appendChild(input);

        //lable
        const label2 = document.createElement("label");
        label2.textContent = "But not if contains:";
        label2.classList.add("lableSize");
        row.appendChild(label2);

        //input fält
        const input2 = document.createElement("input");
        input2.type = "text";
        input2.value = exeption;
        input2.classList.add("kursRuta");
        input2.id = "exeptionInput" + i;
        input2.addEventListener("change", (event) => {
            let newRule = [rule, event.target.value, ignored];
            dt.setExcludeRule(i,newRule);
            reload();
        });
        row.appendChild(input2);

        //knapp
        const button = document.createElement("button");
        
        button.id = "ruleButton" + i;
        button.addEventListener("click", () => {
            ignoreRule(i);
        });
        if (ignored){
            button.textContent = "Aktivera regel";
        } else {
            button.textContent = "Ignorera regel";
        }

        row.appendChild(button);
        
        RulesListContainer.appendChild(row);
        index++;
    }
}

function ignoreRule(i) {
    let ignored = dt.getExcludeRules()[i][2];
    if (ignored){
        dt.getExcludeRules()[i][2] = false;
    } else {
        dt.getExcludeRules()[i][2] = true;
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
        } 
    });
    document.getElementById("LoadCalBtn").addEventListener("click", loadCalSorce);
});