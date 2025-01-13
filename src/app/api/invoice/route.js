import OpenAI from "openai";
import pool from "@/utils/db";

const systemprompt = `You are a helpful AI assistant that performs two main tasks:

1. **SQL Query Generation**:
   You generate SQL queries for a MySQL database based on the below details about the tables in the database:
   - Tables:
      1. **Vendors Table**: Contains details about vendors. The Columns are as follows:
        - VendorID VARCHAR(255) PRIMARY KEY,
        - VendorName VARCHAR(255),
        - ContactName VARCHAR(255),
        - ContactEmail VARCHAR(255),
        - Address VARCHAR(255),
        - PhoneNumber VARCHAR(255),
        - TaxID VARCHAR(255).

     2. **Users Table**: Contains details about employees responsible for processing invoices. The Columns are as follows:
        - UserID VARCHAR(255) PRIMARY KEY,
        - Username VARCHAR(255),
        - Email VARCHAR(255),
        - Role VARCHAR(255),
        - PasswordHash VARCHAR(255).

     3. **Invoices Table**: Contains details about invoices. The Columns are as follows:
        - InvoiceID VARCHAR(255) PRIMARY KEY,
        - VendorID VARCHAR(255), FOREIGN KEY REFERENCES Vendors(VendorID),
        - InvoiceDate VARCHAR(255),
        - DueDate VARCHAR(255),
        - PaymentDate VARCHAR(255),
        - TotalAmount VARCHAR(255),
        - Status VARCHAR(255),
        - ApprovedBy VARCHAR(255), FOREIGN KEY REFERENCES Users(UserID).

     4. **InvoiceItems Table**: Contains details about line items within invoices. The Columns are as follows:
        - InvoiceItemID VARCHAR(255) PRIMARY KEY,
        - InvoiceID VARCHAR(255), FOREIGN KEY REFERENCES Invoices(InvoiceID),
        - Description VARCHAR(255),
        - Quantity VARCHAR(255),
        - UnitPrice VARCHAR(255),
        - TotalPrice VARCHAR(255).

     5. **Payments Table**: Contains details about payments made for invoices. The Columns are as follows:
        - PaymentID VARCHAR(255) PRIMARY KEY,
        - InvoiceID VARCHAR(255), FOREIGN KEY REFERENCES Invoices(InvoiceID),
        - PaymentDate VARCHAR(255),
        - PaymentMethod VARCHAR(255),
        - AmountPaid VARCHAR(255),
        - ConfirmationNumber VARCHAR(255).


  {queryPrompt}
  {normalizationPrompt}
  {operationPrompt}




### Context:
User Question: {context}
`;

const queryPrompt = `Given the above context about the tables in the database, if a user's question requires accessing database information, ALWAYS use the query tool to generate the appropriate SQL query. Some infomration while generating query are :
    - Remember that all columns contain VARCHAR data
    - If the user's question requires to perform an aggregate operation do not perform the operation instead generate query to retrieve all the data on which the aggregation or any other operations will be performed on.
    - If the user's question does not require aggregation or any other calculation like mathematics or date manipulation, generate the query as usual.
    - When generating queries involving numeric values, check for text-based numbers (e.g., "Thirty Thousand").
    - When generating queries for dates even if date is given in date format or text you need to check for text based dates as well as the date format dates.(e.g., "December twenty first 2024" or "2024-12-21")
    - Include both the text-based number and its numeric equivalent in the WHERE clause using an OR condition.
    - Try to check this when you think the columns which might have text based numbers, decimals, dates, percentages and also their numeric counterparts as well.
    - Example: SELECT * FROM Payments WHERE AmountPaid = 'Thirty Thousand' OR AmountPaid = 30000;

    **NOTE:
    - If anything else unrelated to the above tables and database is asked generate the text : "Wrong Prompt"
    
    Return only the generated query.
    `;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatResponse(rawData) {
  if (!rawData || rawData.length === 0) {
    return { columns: [], data: [] };
  }

  // Extract column names from the keys of the first object
  const columns = Object.keys(rawData[0]);

  // Extract values for each row
  const data = rawData.map((row) => columns.map((col) => row[col]));

  // Return the formatted result
  return { columns, data };
}

async function resolveLimitSubquery(connection, query) {
  // Match for problematic subqueries using LIMIT with IN/ANY/ALL/SOME
  const subqueryRegex = /IN\s*\(\s*(SELECT[^)]+LIMIT\s+\d+)\s*\)/i;
  const match = query.match(subqueryRegex);

  if (match) {
    const problematicSubquery = match[1]; // Extract the subquery with LIMIT
    console.log("Executing Subquery with LIMIT:", problematicSubquery);

    // Execute the subquery separately
    const [subResult] = await connection.execute(problematicSubquery);
    if (subResult.length === 0) {
      throw new Error("Subquery returned no results.");
    }

    // Extract values from the subquery result
    const resolvedValues = subResult
      .map((row) => `'${Object.values(row)[0]}'`)
      .join(", ");
    console.log("Resolved Values for IN Clause:", resolvedValues);

    // Replace the original subquery with the resolved values
    const updatedQuery = query.replace(subqueryRegex, `IN (${resolvedValues})`);
    console.log("Updated Query After Resolving Subquery:", updatedQuery);

    return updatedQuery;
  }

  // Return the original query if no matching subquery is found
  return query;
}

export async function POST(req) {
  let connection;
  try {
    // Parse user input from the request body
    const { userInput } = await req.json();

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

    const stringifiedUserInput = userInput.map((message) => {
      if (typeof message.content === "object") {
        // Stringify the content if it's an object
        return { ...message, content: JSON.stringify(message.content) };
      }
      return message;
    });

    const firstPrompt = systemPrompt.replace("{queryPrompt}", queryPrompt);
    const messages = [{ role: "system", content: firstPrompt }];

    // Call the OpenAI API with the system prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    const firstResponse = response.choices[0]?.message.content;
    if (firstResponse == "Wrong Prompt" || firstResponse == null) {
      const errorResponse = {
        columns: ["Message"],
        data: [
          [
            "I am a chatbot for accessing data from the database. Please ask a relevant query about database operations.",
          ],
        ],
      };
      return new Response(JSON.stringify(errorResponse), { status: 200 });
    }
    let query = firstResponse.replace(/```sql\s*|\s*```/g, "").trim();
    console.log("The query generated is :", query);

    if (!connection) {
      connection = await pool.getConnection();
      console.log("Persistent database connection established.");
    }

    // Execute initial query to fetch raw data
    const [dbData] = await connection.execute(query);
    console.log("Fetched Data:", dbData);

    const normalizationPrompt = `You are now tasked with normalizing the data to process.
    - Remember that all columns contain VARCHAR data. Based on the column name, you decide what to do with the instructions.
    
    Instructions:
    1. Check for inconsistencies in numeric, date, and categorical columns.
       - For numeric columns like AmountPaid:
         - Convert text-based numbers (e.g., "Thirty Thousand") to their numeric equivalents (e.g., 30000).
         - Include both the normalized numeric value and the original value in the output.
       - For date columns like PaymentDate:
         - Convert text-based dates (e.g., "December twenty first 2024") to the standard "YYYY-MM-DD" format (e.g., "2024-12-21").
       - For categorical columns, ensure values match expected categories (e.g., "Paid", "Pending").
    
    2. Normalize values where possible:
       - Always attempt normalization instead of excluding rows.
       - Only exclude rows if normalization is completely impossible after multiple attempts.
       - if the data contains anything related to passowords, remove it and its corresponding column and data.
    
    3. Cast data to the appropriate types:
      - For numeric columns like AmountPaid:
        - Ensure all numeric values are converted to their appropriate types: 
          - Whole numbers should be cast to integers.
          - Decimal values should be cast to floating-point numbers (e.g., 30000.50 remains as 30000.50).
        - If a text-based number is converted, ensure the normalized value is in numeric type.
      - For date columns like PaymentDate:
        - Convert text-based dates to the "YYYY-MM-DD" format.
      - Categorical columns should retain string values (e.g., "Paid", "Pending").

    4. If the data does not require normalization, respond with the same data as before.

    
    5. Only Return the updated normalized data in the following JSON formats. Do not give any other information other than the data.:
       {
         "columns": ["Column1", "Column2", ...],
         "data": [[Value1, Value2, ...], ...]
       }
    
    Here is the data to process:
    ${JSON.stringify(dbData)}
    `;

    const secondPrompt = systemPrompt.replace(
      "{normalizationPrompt}",
      normalizationPrompt
    );

    const norm_messages = [{ role: "assistant", content: secondPrompt }];

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: norm_messages,
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

    const { columns, data } = formattedResponse;
    const tableName = "TempNormalizedData";
    console.log("The data in Formatted response is : ", data);

    await connection.execute(`DROP TEMPORARY TABLE IF EXISTS ${tableName};`);

    const createTableSQL = `
      CREATE TEMPORARY TABLE ${tableName} (
        ${columns.map((col) => `${col} VARCHAR(255)`).join(", ")}
      );
    `;

    await connection.execute(createTableSQL);

    const insertSQL = `
    INSERT INTO ${tableName} (${columns.join(", ")})
    VALUES (${columns.map(() => "?").join(", ")});
  `;
    for (const row of data) {
      await connection.execute(insertSQL, row);
    }
    console.log("Data Inserted into Temporary Table.");

    const operationPrompt = `    
    Generate a SQL query for the user's request:  "${userQuestion.content}".
    based on the following normalized data: ${JSON.stringify(
      formattedResponse
    )}.
    for the table name in the query use the name : TempNormalizedData
    Just return the sql query as the output.
    `;

    const thirdPrompt = systemPrompt.replace(
      "{operationPrompt}",
      operationPrompt
    );

    const final_messages = [{ role: "assistant", content: operationPrompt }];

    const thirdResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: final_messages,
    });

    let refinedQuery = thirdResponse.choices[0]?.message.content
      .replace(/```sql\s*|\s*```/g, "")
      .trim();
    console.log("Refined Query:", refinedQuery);

    refinedQuery = await resolveLimitSubquery(connection, refinedQuery);

    const [finalResult] = await connection.execute(refinedQuery);
    console.log("Final Result:", finalResult);

    console.log("The final response from temporary table is : ", finalResult);

    const finalResponse = formatResponse(finalResult);
    console.log(
      "The final response sent back from POST call is : ",
      finalResponse
    );

    return new Response(JSON.stringify(finalResponse), {
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request." }),
      { status: 500 }
    );
  }
}
