export async function onRequest(context) {
    const database = context.env.dattabas;

    if (context.request.method === "POST") {
        const data = await context.request.json();
        var iCal = data.iCal;
        var id = data.id;

        await database
            .prepare("INSERT OR REPLACE INTO calendar (id, iCal) VALUES (?, ?)")
            .bind(id,iCal)
            .run();

        return new Response("Kalender sparad");
    }

    if (context.request.method === "GET") {
        const calendar = await database
            .prepare("SELECT ics FROM calendar WHERE id = 1")
            .first();

        if (!calendar) {
            return new Response("Ingen kalender finns");
        }

        return new Response(calendar.ics, {
            headers: {
                "Content-Type": "text/calendar"
            }
        });
    }
}