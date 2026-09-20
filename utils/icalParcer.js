export function parceIcs(ics = "") {
    const events = [];
    let pos = 0;
    let nextPos;
    while (ics.indexOf("BEGIN", pos) != -1) {
        const event = {}

        pos = ics.indexOf("DTSTART:", pos);

        nextPos = ics.indexOf("DTEND:", pos);
        event["start"] = toJSDate(ics.slice(pos + 8, nextPos - 2));
        pos = nextPos;

        nextPos = ics.indexOf("UID:", pos);
        event["end"] = toJSDate(ics.slice(pos + 6, nextPos - 2));
        pos = nextPos;

        nextPos = ics.indexOf("DTSTAMP:", pos);
        event["id"] = ics.slice(pos + 4, nextPos - 2);
        pos = nextPos;

        nextPos = ics.indexOf("LAST-MODIFIED:", pos);
        event["stamp"] = toJSDate(ics.slice(pos + 8, nextPos - 2));
        pos = nextPos;

        nextPos = ics.indexOf("URL:", pos);
        event["lastModified"] = toJSDate(ics.slice(pos + 14, nextPos - 2));
        pos = nextPos;

        nextPos = ics.indexOf("SUMMARY:", pos);
        event["url"] = unescapeICS(ics, pos + 4, nextPos - 2);
        pos = nextPos;

        nextPos = ics.indexOf("LOCATION:", pos);
        event["summary"] = unescapeICS(ics, pos + 8, nextPos - 2);
        pos = nextPos;

        nextPos = ics.indexOf("DESCRIPTION:", pos);
        event["location"] = unescapeICS(ics, pos + 9, nextPos - 2);
        pos = nextPos;

        nextPos = ics.indexOf("END:", pos);
        event["description"] = unescapeICS(ics, pos + 12, nextPos - 2);
        pos = nextPos;

        events.push(event);
    }
    
    return events;
    
}


function unescapeICS(ics,startPos,endPos) {
    let cuts = [startPos -1];

    for (let pos = startPos; pos < endPos; pos++) {
        if (ics[pos] == "\\" && pos + 1 < endPos) {
            const nextChar = ics[++pos];

            if (nextChar == ",") cuts.push(pos - 1);
            else if (nextChar == ";") cuts.push(pos - 1);
        } else if (ics[pos] == "\r" && ics[pos + 1] == "\n") {
            cuts.push(pos - 1);
            cuts.push(pos);
            cuts.push(pos + 1);
            cuts.push(pos + 2);
        }
    }
    cuts.push(endPos);

    let result = "";
    for (let i = 0; i < cuts.length -1; i++) {
        result += ics.slice(cuts[i] + 1, cuts[i + 1]);
    }
    result = result.replaceAll("\\n","\n");
    
    return result;
}

function toJSDate(icsTime) {
    return new Date(
        Date.UTC(
            Number(icsTime.slice(0, 4)),
            Number(icsTime.slice(4, 6)) - 1,
            Number(icsTime.slice(6, 8)),
            Number(icsTime.slice(9, 11)),
            Number(icsTime.slice(11, 13)),
            Number(icsTime.slice(13, 15))
        )
    );
}