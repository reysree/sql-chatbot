import pool from "@/utils/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { query, values = [] } = body;
    console.log("The body is : ", body);
    console.log("The query is : ", query);
    console.log("The values are : ", values);

    if (!query) {
      return new Response(JSON.stringify({ error: "No query provided." }), {
        status: 400,
      });
    }

    let rows;
    if (values && Array.isArray(values)) {
      // Execute with parameterized values
      console.log("Executing query with values:", query, values);
      [rows] = await pool.execute(query, values);
    } else {
      // Execute query without values
      console.log("Executing query:", query);
      [rows] = await pool.execute(query);
    }

    return new Response(JSON.stringify({ data: rows }), { status: 200 });
  } catch (error) {
    console.error("Database query failed:", error);
    return new Response(JSON.stringify({ error: "Database query failed." }), {
      status: 500,
    });
  }
}
