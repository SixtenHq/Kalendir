import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
import { cal } from "./script.js";


 export async function uploadCal() {
    console.log("uppload start");
    var iCal =  new ICAL.Component(cal).toString();
    var id = crypto.randomUUID();
    if (!iCal) console.log("SDASVBAOUFVUVFVEUFVUEAVFJDKASFDYSFAD")

    var data = JSON.stringify({
        iCal: iCal,
        id: id
    })


    const response = await fetch("/onPageWorker", {
        method: "POST",
        body: data
    });

    const result = await response.text();

    console.log(result);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("uploadBtn").addEventListener("click", uploadCal);
});