export async function onRequest(context) {
    try {

        const database = context.env.dattabas;
        
        if (context.request.method === "POST") {
            const packet = await context.request.json();
            var id = packet.id;
            var data = packet.data;
        
            await database
                .prepare("INSERT OR REPLACE INTO calendar (id, data) VALUES (?, ?)")
                .bind(id,data)
                .run();
        
            return new Response("Kalender sparad");
        }
    
        /*if (context.request.method === "GET") {
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
        }*/

    } catch (error) {
        console.error(error);

        return new Response(error.stack, {
            status: 500
        });
    }
}