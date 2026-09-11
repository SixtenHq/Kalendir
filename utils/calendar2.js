import ICAL from "ical.js";
import * as dt from "./data.js";
import * as time from "./time.js";


export async function updateCal() {
    await importCal();
}

async function importCal() {
        
    const CalSorceLinks = dt.getCalSorces();
    const savedEvents = dt.getEvents();
    const newEventList = new Map();
    
    //import new events
    for (const link of CalSorceLinks) {
        
        const response = await fetch(link);
        const ics = await response.text();
        const comps = new ICAL.Component(ICAL.parse(ics));
        const importedEvents = comps.getAllSubcomponents("vevent");
        const currentTime = Date.now();
        
        time.start();
        time.pause();
        for (const e of importedEvents) {
            
            time.unpause();
            const id = e.getFirstPropertyValue("uid");
            time.pause();
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
                savedEvents.delete(id);
            } else {
                newEventList.set(id, savedEvent); // FEL!!!!!!!!!!!!!!!!!!!!
            }
            
        } 
    }    
    time.end();
    // spara gamla event
    for (const e of savedEvents) {
        if (!newEventList.get(e.id) && e.start < currentTime) {
            newEventList.set(e.id, e);
        }
    }
}

function makeCal() {

}
