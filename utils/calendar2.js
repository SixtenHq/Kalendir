import ICAL from "ical.js";
import * as dt from "./data.js";
import * as time from "./time.js";
import { parceIcs } from "./icalParcer.js";


export async function updateCal() {
    time.start();
    await importCal();
    time.end();
}

async function importCal() {
    
    const CalSorceLinks = dt.getCalSorces();
    const savedEvents = dt.getEvents();
    const newEventList = new Map();
    
    //import new events
    for (const link of CalSorceLinks) {
        time.pause();
        const response = await fetch(link);
        const ics = await response.text();
        time.unpause();
        let importedEvents = parceIcs(ics);
        const currentTime = Date.now();

        for (const impEvent of importedEvents) {            
            const id = impEvent.id;
            const savedEvent = savedEvents.get(id);
            
            if (!savedEvent || impEvent.lastModified < savedEvent.lastModified) {
                newEventList.set(id, impEvent);
                savedEvents.delete(id);
            } 
        } 
    }    
    // spara gamla event
    for (const event of savedEvents) {
        if (!newEventList.get(event.id) && event.start < currentTime) {
            newEventList.set(event.id, eevnet);
        }
    }
}
