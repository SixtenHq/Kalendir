import { cal } from "./script.js";


 export async function uploadCal() {
    console.log("uppload start");
    var id = crypto.randomUUID();

    var data = JSON.stringify({
        iCal: Cal,
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