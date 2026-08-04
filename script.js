import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";

// Test
console.log(ICAL);

function changeText() {
    document.getElementById("title").innerHTML = "Det fungerar!";
}


async function getCalendar() {
    const response = await fetch("https://cloud.timeedit.net/liu/web/schema/ri67Z146X55Z09Q6Z56g2Y00y6026Y02n00gQY6Q537610Q13.ics");
    const data = await response.text();

    console.log(data); // visar rå .ics-fil

    const jcalData = ICAL.parse(data);
    const comp = new ICAL.Component(jcalData);

    console.log(comp); // visar kalenderobjektet

    const vevents = comp.getAllSubcomponents("vevent");

    vevents.forEach(event => {
    const e = new ICAL.Event(event);

    console.log("Titel:", e.summary);
    console.log("Start:", e.startDate.toString());
    console.log("Slut:", e.endDate.toString());
});
}

getCalendar();