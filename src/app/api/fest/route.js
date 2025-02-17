import OpenAI from "openai";
import { getPrismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

const systemPrompt = ` You are a helpful AI assistant that performs two main tasks:

1. **SQL Query Generation**:
   You generate SQL queries for a MySQL database based on the below details about the tables in the database:
   - Tables:
     1. **Payments Table**: Contains details about payments. The Columns are as follows:
        - payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        - user_gid VARCHAR(255) NOT NULL (References students(gid)),
        - amount DECIMAL(38,2) NOT NULL,
        - currency VARCHAR(3) DEFAULT "USD",
        - payment_status VARCHAR(255) NOT NULL,
        - transaction_id VARCHAR(255) NULL,
        - payment_date TIMESTAMP DEFAULT NOW(),
        - card_last_four VARCHAR(4) NULL,
        - card_type VARCHAR(255) NULL,
        - card_expiry_month INT NULL,
        - card_expiry_year INT NULL,
        - FOREIGN KEY(user_gid) REFERENCES students(gid)
     2. **Students Table**: Contains details about students registered in the system. The Columns are as follows:
        - id  INT PRIMARY KEY AUTO_INCREMENT,
        - gid  VARCHAR(255) UNIQUE NOT NULL,
        - first_name  VARCHAR(255) NOT NULL,
        - last_name  VARCHAR(255) NOT NULL,
        - email  VARCHAR(255) UNIQUE NOT NULL,
        - password  VARCHAR(255) NOT NULL,
        - One-to-Many Relationship → A student can have multiple payments linked via payments.user_gid,

     ### **Important:**
   - **ALWAYS use parameterized queries**. DO NOT insert user values directly into SQL strings.
   - **Return the output in a structured JSON format** with:
     - **query** → The SQL statement with '?' as placeholders.
     - **values** → An array of actual values to be used in place of the placeholders.
   - Do not consider the columns which have sensitive information such as passwords.
   - If asked anything similar to SHOW tables please generate respective query.
     
   ### **Example Format**:
   \`\`\`json
   {
     "query": "SELECT * FROM Students WHERE name = ?",
     "values": ["John Doe"]
   }
   \`\`\`

   Given the above context about the tables in the database, if a user's question requires accessing database information please access it.
   
   Note :
   If for the given user question you are unable to generate the query or if anything unrelated to the database is asked give the below output:
      \`\`\`json
   {
      "errormessage": "Please ask me anything related to the selected database"
   }
   \`\`\`  


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
    // ✅ Parse user input
    const { userInput } = await req.json();
    if (!userInput || !Array.isArray(userInput)) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 }
      );
    }

    const userQuestion = userInput[userInput.length - 1];
    if (!userQuestion || typeof userQuestion.content !== "string") {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    // ✅ Generate SQL Query Using OpenAI
    const systemGeneratedPrompt = systemPrompt.replace(
      "{context}",
      userQuestion.content
    );
    const messages = [{ role: "system", content: systemGeneratedPrompt }];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    const rawQuery = response.choices[0]?.message.content;
    console.log("The raw query from the response is : ", rawQuery);
    if (!rawQuery) {
      return NextResponse.json(
        { error: "Failed to generate SQL query" },
        { status: 500 }
      );
    }

    // ✅ Extract SQL Query from OpenAI Response
    let sqlQueryObject;
    try {
      const cleanedResponse = rawQuery.replace(/```json|```/g, "").trim();
      sqlQueryObject = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Error parsing OpenAI SQL response:", error);
      return NextResponse.json(
        { error: "Invalid JSON format from OpenAI" },
        { status: 500 }
      );
    }
    console.log("The data in sql query object is : ", sqlQueryObject);

    if (sqlQueryObject.errormessage) {
      return NextResponse.json(
        { error: sqlQueryObject.errormessage },
        { status: 200 }
      );
    }

    const { query, values } = sqlQueryObject;
    if (!query) {
      return NextResponse.json(
        { error: "Invalid SQL query generated" },
        { status: 400 }
      );
    }

    console.log("Executing Query:", query, "with Values:", values);

    const prisma = getPrismaClient("fest"); // Uses the correct database

    const dbResult = await prisma.$queryRawUnsafe(query, ...(values || []));

    console.log("the data retrieved from the database is : ", dbResult);

    messages.push({
      role: "assistant",
      content: `Here is the data returned from the database: ${JSON.stringify(
        dbResult
      )}`,
    });

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    const rawContent = secondResponse.choices[0]?.message.content;

    console.log("Raw Content from Second Response:", rawContent);

    let formattedResponse;
    try {
      const jsonContent = rawContent.replace(/```json|```/g, "").trim(); // Remove markdown formatting
      console.log("The json content now is : ", jsonContent);
      formattedResponse = JSON.parse(jsonContent); // Parse the cleaned JSON
    } catch (error) {
      console.error("Failed to parse formatted response as JSON:", error);
      throw new Error("Invalid JSON format in OpenAI response.");
    }
    console.log("Formatted Data for UI:", formattedResponse);

    const formattedDbResult = dbResult.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === "bigint" ? value.toString() : value,
        ])
      );
    });

    return new Response(JSON.stringify(formattedResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing OpenAI query:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
