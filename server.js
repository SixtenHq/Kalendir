import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
import * as dt from "./data.js";


export async function uploadCal() {
    console.log("uppload start");

    if (!dt.getId()) {
        dt.setId(crypto.randomUUID());
        console.log("new id: " + dt.getId());
    } 

    var packet = JSON.stringify({
        id: dt.getId(),
        data: dt.exportData()
    })

    const url = new URL("https://kalendir.pages.dev/worker");
    url.searchParams.set("id", dt.getId());
    console.log(url.toString());


    const response = await fetch("/onPageWorker", {
        method: "POST",
        body: packet
    });

    const result = await response.text();

    console.log(result);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("uploadBtn").addEventListener("click", uploadCal);
});