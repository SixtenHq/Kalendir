import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";

let calendar;

function createCalendar() {
    calendar = new FullCalendar.Calendar(
        document.getElementById("calendar"),
        {
            initialView: "timeGridWeek",

            eventContent: function(arg) {

                let button = document.createElement("button");
                button.innerHTML = "Info";

                button.onclick = function(event) {
                    event.stopPropagation(); // hindrar att hela eventet klickas
                    console.log("Knapp klickad:", arg.event.title);
                };

                let container = document.createElement("div");

                container.appendChild(document.createTextNode(arg.event.title));
                container.appendChild(button);

                return { domNodes: [container] };
            }
        }
    );

    calendar.render();
}


async function addIcal() {
    const text = document.getElementById("newIcalLink").value;
    const response = await fetch(text);
    const data = await response.text();

    const jcalData = ICAL.parse(data);
    const comp = new ICAL.Component(jcalData);

    const vevents = comp.getAllSubcomponents("vevent");

    vevents.forEach(event => {
        const e = new ICAL.Event(event);

        console.log("Titel:", e.summary);
        console.log("Start:", e.startDate.toString());
        console.log("Slut:", e.endDate.toString());

        calendar.addEvent({
            title: e.summary,
            start: e.startDate.toJSDate(),
            end: e.endDate.toJSDate(),
            extendedProps: {
                originalEvent: e
            }
        });

    });

    AlterIcal(comp)
}

function AlterIcal(comp) {
    const vevents = comp.getAllSubcomponents("vevent");

    // tar bort första händelsen
    comp.removeSubcomponent(vevents[0]);

    // ny kalender
    const newIcs = comp.toString();

    console.log(newIcs);

}



document.addEventListener("DOMContentLoaded", () => {
    createCalendar();

    document.getElementById("addNewIcal").addEventListener("click", addIcal);
});

//https://cloud.timeedit.net/liu/web/schema/ri67Z146X55Z09Q6Z56g2Y00y6026Y02n00gQY6Q537610Q13.ics