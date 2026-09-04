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

    const url = new URL("https://kalendir.pages.dev/import");
    url.searchParams.set("id", dt.getId());
    console.log(url.toString());


    const response = await fetch("/onPageWorker", {
        method: "POST",
        body: packet
    });

    const result = await response.text();

    console.log(result);
}

export async function getInfo() {
    const input = document.getElementById("InternalCalTextField").value;
    const inUrl = new URL(input);
    const id = inUrl.searchParams.get("id");
    console.log(id);

    const url = new URL("/onPageWorker", window.location.href);
    url.searchParams.set("id", id);

    const response = await fetch(url, {
        method: "GET",
    });

    const result = await response.text();

    console.log(result);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("uploadBtn").addEventListener("click", uploadCal);
    document.getElementById("InternalCalBtn").addEventListener("click", getInfo);
});