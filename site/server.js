import * as dt from "../utils/data.js";
import { reload } from "./front.js";

export async function uploadCal() {
    console.log("uppload start");

    dt.makeSubLinks();
    reload();

    var packet = JSON.stringify({
        id: dt.getUserId(),
        data: dt.exportData()
    })

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
    const data = JSON.parse(result);

    dt.importData(data);
    reload();
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("uploadBtn").addEventListener("click", uploadCal);
    document.getElementById("InternalCalBtn").addEventListener("click", getInfo);
});