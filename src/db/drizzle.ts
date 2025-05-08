// db/drizzle.ts
// Create a dummy or real db object based on environment

// This pattern ensures the imports only happen in a server context
// and the client bundle never tries to import these modules
import {drizzle} from "drizzle-orm/node-postgres";

let db;

if (typeof window === 'undefined') {
    // We're on the server, dynamically import the database modules
    db = drizzle(process.env.DATABASE_URL!);
} else {
    // We're in the browser, provide a dummy object
    db = new Proxy({}, {
        get: () => {
            throw new Error('Database can only be accessed on the server');
        }
    });
}
export {db}
// export const db = drizzle(process.env.DATABASE_URL!);