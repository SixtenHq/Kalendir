import { updateCal } from "../utils/calendar.js";
import * as dt from "../utils/data.js";
import { Calendar } from 'fullcalendar';
import timeGridPlugin from 'fullcalendar/timegrid';
import classicThemePlugin from "fullcalendar/themes/classic";

import "fullcalendar/skeleton.css";
import "fullcalendar/themes/classic/theme.css";
import "fullcalendar/themes/classic/palette.css";

let calendar;

export async function reload(doImport) {
    await updateCal(doImport);
    reloadSourceList();
    reloadCourseList();
    reloadExcludeList();
    reloadCategorieList();
    updateCalView();
    reloadSubLinkList()
}

async function loadCalSorce() {
    const field = document.getElementById("CalSorceTextfield");
    const CalSorceLink = field.value;
    
    if (!CalSorceLink.includes("cloud.timeedit.net/liu/web/schema")) {
        console.log("fel sorce link!");
        return;
    }
    if (dt.sorcesIncludes(CalSorceLink)) {
        console.log("redan inlagd");
        return;
    }
    const date = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Stockholm"
    });
    dt.addSorce(CalSorceLink, date);
    //field.value = "";
    
    reload(true);
}

// ------------------ kalender UI -------------------

// skapa kalendervisning
function createCalendar() {
    calendar = new Calendar(
        document.getElementById("calendar"),
        {
            plugins: [
                timeGridPlugin,
                classicThemePlugin
            ],
            initialView: "timeGridWeek",
            slotMinTime: "06:00:00",
            firstDay: 1,

            headerToolbar: {
                left: "prev,next",
                center: "title",
                right: ""
            },

            eventClick: function(info) {
                const calBox = info.event;
                const event = dt.getEvents().get(calBox.id);

                event.categorie++;
                const categories = dt.getCategories();
                if (event.categorie >= categories.length) event.categorie = 0;
                
                if (event.categorie == 1) event.locked = false;
                else event.locked = true;

                calBox.setProp("color", categories[event.categorie].colour);
                if (event.categorie == 0) calBox.setProp("className", "striped-event");
                else calBox.setProp("className", "");                
            }           
        }
    );

    calendar.render();
}

function updateCalView() {
    calendar.removeAllEvents();
    const events = dt.getEvents();
    const categories = dt.getCategories();

    for (const event of events.values()) {
        const calEvent = {
            title: event.summary,
            start: event.start,
            end: event.end,
            id: event.id,
            color: categories[event.categorie].colour
        };

        if (event.categorie == 0) {
            calEvent.className = "striped-event";
        } else {
            calEvent.className = "";
        }

        calendar.addEvent(calEvent);
    }
}

// ------------------- sorce list -------------------------------

function reloadSourceList() {
    const sourceListContainer = document.getElementById("sourceList");
    sourceListContainer.innerHTML = "";

    sourceListContainer.appendChild(newTitle("Sources"));
    const sorces = dt.getSorces();

    sorces.forEach((sorce, i) => {
        const row = document.createElement("div");
        row.classList.add("courseRow")

        // lable
        row.appendChild(newLable("Added " + sorce.time));
        row.appendChild(newLable("Link: "));
        const linkfield = newInput(sorce.link);
        linkfield.readOnly = true;
        linkfield.classList.add("readOnlyInput");
        row.appendChild(linkfield);

        // knapp
        const button = newButton("Remove");
        button.addEventListener("click", () => {
            dt.removeSorce(i);
            reload(true);
        });
        row.appendChild(button);
        
        sourceListContainer.appendChild(row);
    });
}

// ------------------ Curslistan -------------------

function reloadCourseList() {
    const corseListContainer = document.getElementById("courseList");
    corseListContainer.innerHTML = "";

    corseListContainer.appendChild(newTitle("Corse options"));

    for (const [courseCode, courseInfo] of Object.entries(dt.getCourses())) {
        const row = document.createElement("div");
        row.classList.add("courseRow")
        if (courseInfo.ignored) {
            row.classList.add("gray");
        }

        // lable
        row.appendChild(newLable(courseCode + ": "+ courseInfo.name));

        // input fält
        const input = document.createElement("input");
        input.type = "text";
        if (courseInfo.customName) input.value = courseInfo.customName;
        input.placeholder = "Custom name"
        input.classList.add("kursRuta");
        input.addEventListener("change", () => {
            const course = dt.getCourses()[courseCode];
            if (course) {
                course.customName = input.value;
                reload(false);
            }
        });
        row.appendChild(input);

        // knapp
        const button = document.createElement("button");
        if (courseInfo.ignored) button.textContent = "My course";
        else button.textContent = "Not my course";
        button.addEventListener("click", () => {
            ignoreCourse(courseCode);
        });
        
        row.appendChild(button);
        
        corseListContainer.appendChild(row);
    }
}

function ignoreCourse(courseCode) {
    var course = dt.getCourse(courseCode);
    if (course.ignored){
        course.ignored = false;
    } else {
        course.ignored = true;
    }
    reload(false);
}

// --------- ecclude list ----------------

function reloadExcludeList() {
    const excludeListContainer = document.getElementById("excludeList");
    excludeListContainer.innerHTML = "";
    const excludeIndex = 0;
    const rules = dt.getRules(excludeIndex);

    excludeListContainer.appendChild(newTitle("Exclusion options"));

    rules.forEach((rule, i) => {
        const row = document.createElement("div");
        row.classList.add("courseRow")
        //lable
        row.appendChild(newLable("Exclude if contains:"));

        //input fält
        const input = newInput(rule.matchText);
        input.addEventListener("change", () => {
            dt.setRule(excludeIndex, i, input.value, rule.ignoreText);
            reload(false);
        });
        row.appendChild(input);

        //lable
        row.appendChild(newLable("But not if contains:"));

        //input fält
        const input2 = newInput(rule.ignoreText);
        input2.addEventListener("change", () => {
            dt.setRule(excludeIndex, i, rule.matchText, input2.value);
            reload(false);
        });
        row.appendChild(input2);

        //knapp
        const button = newButton("Remove");
        button.addEventListener("click", () => {
            dt.removeRule(excludeIndex, i);
            reload(false);
        });
        row.appendChild(button);

        excludeListContainer.appendChild(row);
    });
    const button = newButton("Add exclusion rule");
    button.addEventListener("click", () => {
        dt.addRule(excludeIndex,"","");
        reload(false);
    });
    excludeListContainer.appendChild(button);
}

//---------- catagory list ---------------

function reloadCategorieList() {
    const categorieListContainer = document.getElementById("categorieList");
    categorieListContainer.innerHTML = "";
    
    const categories = dt.getCategories();

    categorieListContainer.appendChild(newTitle("Categorie options"));

    for (const catagorie of categories) {
        if (catagorie.index < 2) continue;


        const startRow = document.createElement("div");
        startRow.classList.add("courseRow");
        //lable
        startRow.appendChild(newLable("Catagorie name:"));

        //input fält
        const startinput = newInput(catagorie.name);
        startinput.addEventListener("change", () => {
            dt.setCategorieName(catagorie.index, startinput.value)
            reload(false);
        });
        startRow.appendChild(startinput);

        //lable
        startRow.appendChild(newLable("Select color:"));

        //färg välgare
        const colournames = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink"];
        const colours = ["#FF6467", "#FF8904", "#FDC745", "#05DF72", "#21BCFF", "#A684FF", "#ED6AFF"];
        const dropdown = document.createElement("select");
        for (let i = 0; i < colours.length; i++){
            const option = document.createElement("option");
            option.value = colours[i];
            option.textContent = colournames[i];
            dropdown.appendChild(option);
        }
        dropdown.value = catagorie.colour;
        dropdown.addEventListener("change", () => {
                dt.setCategorieColour(catagorie.index, dropdown.value);
                reload(false);
            });
        startRow.appendChild(dropdown);

        //info
        startRow.appendChild(newInfo("The colors are only on this site, they will not be applied for your calendar"));
        //knapp
        const startbutton = newButton("Remove catagorie");
        startbutton.addEventListener("click", () => {
            dt.removeCategorie(catagorie.index);
            reload(false);
        });
        startRow.appendChild(startbutton);
        categorieListContainer.appendChild(startRow);



        const rules = catagorie.rules;

        rules.forEach((rule, i) => {
            const row = document.createElement("div");
            row.classList.add("courseRow");
            //lable
            row.appendChild(newLable("Add to catagorie if contains:"));
            //input fält
            const input = newInput(rule.matchText);
            input.addEventListener("change", () => {
                dt.setRule(catagorie.index, i, input.value, rule.ignoreText);
                reload(false);
            });
            row.appendChild(input);
            //lable
            row.appendChild(newLable("But not if contains:"));
            //input fält
            const input2 = newInput(rule.ignoreText);
            input2.addEventListener("change", () => {
                dt.setRule(catagorie.index, i, rule.matchText, input2.value);
                reload(false);
            });
            row.appendChild(input2);
            //knapp
            const button = newButton("Remove");
            button.addEventListener("click", () => {
                dt.removeRule(catagorie.index, i);
                reload(false);
            });
            row.appendChild(button);

            categorieListContainer.appendChild(row);
        });
        //button
        const button = newButton("Add catagorie rule");
        button.addEventListener("click", () => {
            dt.addRule(catagorie.index,"","");
            reload(false);
        });
        categorieListContainer.appendChild(button);

        //line
        const line = document.createElement("hr");
        line.style.width = "50%";
        categorieListContainer.appendChild(line);

    }
    const button = newButton("Add catagorie");
    button.addEventListener("click", () => {
        dt.newCategorie();
        reload(false);
    });
    categorieListContainer.appendChild(button);
}

function reloadSubLinkList() {
    const subLinkListContainer = document.getElementById("subLinkList");
    subLinkListContainer.innerHTML = "";

    subLinkListContainer.appendChild(newTitle("Subscription links"));
    const categories = dt.getCategories();

    for (const categorie of categories) {
        const row = document.createElement("div");
        row.classList.add("courseRow")

        row.appendChild(newLable(categorie.name));
        row.appendChild(newLinkField(dt.getSubLink(categorie.index)));
        subLinkListContainer.appendChild(row);
    }
}

function newLinkField(value){
    const linkfield = newInput(value);
    linkfield.readOnly = true;
    linkfield.classList.add("readOnlyInput");
    return linkfield;
}

function newTitle(text) {
    const title = document.createElement("h4");
    title.textContent = text;
    return title;

}

function newButton(text) {
    const button = document.createElement("button");
    button.textContent = text;
    return button;
}

function newInput(value) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.classList.add("kursRuta");
    return input;
}

function newLable(text) {
    const label = document.createElement("label");
    label.textContent = text;
    label.classList.add("lableSize");
    return label;
}

function newInfo(text) {
    const info = document.createElement("span");
    info.className = "info";
    info.textContent = "i";
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.textContent = text;
    info.appendChild(tooltip);
    return info;
}


document.addEventListener("DOMContentLoaded", () => {
    createCalendar();
    document.getElementById("LoadCalBtn").addEventListener("click", loadCalSorce);
});