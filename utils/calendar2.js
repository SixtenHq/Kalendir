import ICAL from "ical.js";
import * as dt from "./data.js";


export async function updateCal() {
    await loadCalFromSorce();
}

async function loadCalFromSorce() {
    
    /*if (!dt.hasCal()) {
        makeCal();
    }*/

    
    const CalSorceLinks = dt.getCalSorces();
    const savedEvents = new Map();
    const newEventList = new Map();
    const currentTime = new Date.now();
    
    for (const link of CalSorceLinks) {
        // get calendar from TimeEdit
        
        const response = await fetch(link);
        const ics = await response.text();
        const comps = new ICAL.Component(ICAL.parse(ics));
        const importedEvents = comps.getAllSubcomponents("vevent");
        

        for (const e of importedEvents) {
            const id = e.getFirstPropertyValue("uid");
            const savedEvent = savedEvents.get(id);
            const importedEventLastModified = e.getFirstPropertyValue("last-modified").toJSDate();

            if (!savedEvent || importedEventLastModified < savedEvent.lastModified) {
                newEventList.set(id, {
                    start: e.getFirstPropertyValue("dtstart").toJSDate(),
                    end: e.getFirstPropertyValue("dtend").toJSDate(),
                    id: id,
                    stamp: e.getFirstPropertyValue("dtstamp").toJSDate(),
                    lastModified: importedEventLastModified,
                    url: e.getFirstPropertyValue("url"),
                    summary: e.getFirstPropertyValue("summary"),
                    location: e.getFirstPropertyValue("location"),
                    description: e.getFirstPropertyValue("description")
                });
            } else {
                newEventList.set(id, savedEvent);
            }
        } 
    }    
    console.log(newEventList);
}

function makeCal() {

}
