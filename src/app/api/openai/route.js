import OpenAI from "openai";

const systemprompt = `You are a helpful AI assistant that performs two main tasks:

1. **SQL Query Generation**:
   You generate SQL queries for a MySQL database based on the below details about the tables in the database:
   - Tables:
     1. **Employee Table**: Contains details about employees. The Columns are as follows:
        - eid INT PRIMARY KEY,
        - name VARCHAR(100) NOT NULL,
        - age INT,
        - dept_id INT,
        - FOREIGN KEY(dept_id) REFERENCES Department(dept_id).
     2. **Address Table**: Contains details about the addresses of each employee. The Columns are as follows:
        - address_id INT PRIMARY KEY,
        - eid INT NOT NULL,
        - street VARCHAR(255),
        - city VARCHAR(100),
        - state VARCHAR(100),
        - postal_code VARCHAR(20),
        - country VARCHAR(100),
        - FOREIGN KEY(eid) REFERENCES Employee(eid).
     3. **Department Table**: Contains the details of each department. The Columns are as follows:
        - dept_id INT PRIMARY KEY,
        - dept_name VARCHAR(100) NOT NULL.

   Given the above context about the tables in the database, if a user's question requires accessing database information, ALWAYS use the query tool to generate the appropriate SQL query.

   ### Important:
   ONLY use the query tool to generate SQL queries. Do not attempt to answer questions directly without using the tool.

2. **Database Response Processing**:
   When provided with a JSON-formatted response from a database query, your task is to interpret the data and structure it into a JSON object suitable for easily displaying as a table in a user interface.

   ### Formatting Guidelines:
   - The JSON object should have a 'columns' array containing the column names.
   - It should also have a 'data' array containing arrays of row values.

   Example Input (Database Response):
   \`\`\`json
   {
     "data": [
       { "name": "John Doe", "age": 30 },
       { "name": "Jane Smith", "age": 25 }
     ]
   }
   \`\`\`

   Example Output (JSON Object):
   \`\`\`json
   {
     "columns": ["Name", "Age"],
     "data": [
       ["John Doe", 30],
       ["Jane Smith", 25]
     ]
   }
   \`\`\`

### Context:
User Question: {context}
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    // Parse user input from the request body
    const { userInput } = await req.json();
    console.log("Everytime the userInput is received : ", userInput);

    // console.log(
    //   "Validating userInput:",
    //   userInput.map((msg) => ({
    //     role: msg.role,
    //     contentType: typeof msg.content,
    //     content: msg.content,
    //   }))
    // );
    console.log(!userInput);
    console.log(!Array.isArray(userInput));
    console.log(userInput.some((msg) => !msg.content));
    console.log(
      userInput.some(
        (msg) => typeof msg.content === "string" && msg.content.trim() === ""
      )
    );
    console.log(
      userInput.some(
        (msg) =>
          typeof msg.content === "object" &&
          (!msg.content.columns || !msg.content.data)
      )
    );

    // if (
    //   !userInput ||
    //   !Array.isArray(userInput) ||
    //   userInput.some(
    //     (msg) =>
    //       !msg.content || // Checks if content exists
    //       (typeof msg.content === "string" && msg.content.trim() === "") || // Handles empty strings
    //       (typeof msg.content === "object" &&
    //         (!msg.content.columns || !msg.content.data)) // Validates object structure
    //   )
    // ) {
    //   return new Response(JSON.stringify({ error: "User input is required" }), {
    //     status: 400,
    //   });
    // }

    if (
      !userInput ||
      !Array.isArray(userInput) ||
      !userInput.every((msg) => {
        if (msg.role === "assistant" && msg.content === "") {
          // Allow empty content for assistant placeholders
          return true;
        }
        if (typeof msg.content === "string") {
          return msg.content.trim() !== ""; // Ensure non-empty strings
        }
        if (typeof msg.content === "object") {
          return (
            Array.isArray(msg.content.columns) &&
            Array.isArray(msg.content.data)
          ); // Validate object structure
        }
        return false; // Invalid cases
      })
    ) {
      return new Response(JSON.stringify({ error: "User input is required" }), {
        status: 400,
      });
    }

    const userQuestion = userInput[userInput.length - 1];
    if (!userQuestion || typeof userQuestion.content !== "string") {
      throw new Error(
        "Invalid message format: last message is missing or has invalid content"
      );
    }
    //console.log("Received last message", userQuestion.content);
    const systemPrompt = systemprompt.replace(
      "{context}",
      userQuestion.content
    );

    const tools = [
      {
        type: "function",
        function: {
          name: "query_database",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" }, // SQL query to execute
            },
            required: ["query"],
          },
        },
      },
    ];

    const messages = [{ role: "system", content: systemPrompt }, ...userInput];

    // Call the OpenAI API with the system prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools,
    });

    console.log(
      "The query returned by the AI : ",
      response.choices[0].message.content
    );

    // Extract the generated SQL query from the response
    const sqlQuery = response.choices[0]?.message.content;
    console.log("Tool Calls : ", response);
    if (response.choices[0].message.tool_calls) {
      const toolCall = response.choices[0].message.tool_calls[0];
      console.log(
        "Available tool calls are : ",
        response.choices[0].message.tool_calls[0]
      );
      if (toolCall.function.name === "query_database") {
        // Execute the query in your backend or database API
        console.log("Entered query_databass and toolCall is : ", toolCall);

        let query;
        try {
          const args = JSON.parse(toolCall.function.arguments);
          query = args.query;
        } catch (error) {
          console.error("Failed to parse toolCall arguments:", error);
          return;
        }
        if (!query) {
          console.error("Query not found in toolCall arguments.");
          return;
        }
        console.log("SQL Query:", query);

        const dbResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/query`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          }
        );

        if (!dbResponse.ok) {
          console.error("Database query failed.");
          return;
        }
        const dbData = await dbResponse.json();

        messages.push({
          role: "assistant",
          content: `Here is the data returned from the database: ${JSON.stringify(
            dbData
          )}`,
        });

        const secondResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messages,
        });

        // Extract the content from the response
        const rawContent = secondResponse.choices[0]?.message.content;

        console.log("Raw Content from Second Response:", rawContent);

        // Clean the content to extract valid JSON
        let formattedResponse;
        try {
          const jsonContent = rawContent.replace(/```json|```/g, "").trim(); // Remove markdown formatting
          formattedResponse = JSON.parse(jsonContent); // Parse the cleaned JSON
        } catch (error) {
          console.error("Failed to parse formatted response as JSON:", error);
          throw new Error("Invalid JSON format in OpenAI response.");
        }

        console.log("Formatted Data for UI:", formattedResponse);
        return new Response(JSON.stringify(formattedResponse), { status: 200 });
      }
    }
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate SQL query" }),
      { status: 500 }
    );
  }
}
