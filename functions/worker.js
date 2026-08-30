export async function onRequest(context) {
    const env = context.env;
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    // Hämta kalender från D1
    const result = await env.dattabas
        .prepare("SELECT data FROM calendar WHERE id = ?")
        .bind(id)
        .first();

    if (!result) {
        return new Response("Kalender hittades inte", {
            status: 404
        });
    }
    var cal = result.data.getCal();
    var ics = new ICAL.Component(cal).toString();

    return new Response(ics, {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8"
        }
    });
}