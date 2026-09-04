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
    
        if (context.request.method === "GET") {
            const url = new URL(context.request.url);
            const id = url.searchParams.get("id");

            const inData = await database
                .prepare("SELECT data FROM calendar WHERE id = ?")
                .bind(id)
                .first();
        
            if (!inData) {
                return new Response("hittade inte data");
            }
        
            return new Response(inData.data, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }

    } catch (error) {
        console.error(error);

        return new Response(error.stack, {
            status: 500
        });
    }
}