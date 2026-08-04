export async function onRequest(context) {

    const db = context.env.dattabas;

    if (context.request.method === "POST") {

        const ics = await context.request.text();

        await db.prepare(
            "INSERT OR REPLACE INTO calendar (id, ics) VALUES (1, ?)"
        )
        .bind(ics)
        .run();

        return new Response("Kalender sparad");
    }


}