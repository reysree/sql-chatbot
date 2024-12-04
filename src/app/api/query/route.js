import pool from "@/utils/db";

export async function POST(req) {
  try {
    const body = await req.json(); // Get the SQL query from the request body
    console.log("Request Body : ", body);
    const { query } = body;
    if (!query) {
      return new Response(JSON.stringify({ error: "No query provided." }), {
        status: 400,
      });
    }

    // Execute the query
    console.log("the query sent to db route is : ", req);
    const [rows] = await pool.execute(query);

    // Return the query results
    return new Response(JSON.stringify({ data: rows }), { status: 200 });
  } catch (error) {
    console.error("Database query failed:", error);
    return new Response(JSON.stringify({ error: "Database query failed." }), {
      status: 500,
    });
  }
}
