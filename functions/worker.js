export async function onRequest(context) {

    const result = await context.env.DB
        .prepare("SELECT * FROM calendar")
        .all();

    return Response.json(result);
}