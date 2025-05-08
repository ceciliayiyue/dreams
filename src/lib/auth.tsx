import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@/db/drizzle";
import {nextCookies} from "better-auth/next-js";
import * as schema from "@/db/schema";
import {admin} from "better-auth/plugins";


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: false,
        schema
    }),
    session: {
        cookieCache: {
            enabled: true,
            // Cache duration in seconds.
            // set to 5 mins for development;
            // could be a week or longer in production
            maxAge: 5 * 60
        }
    },
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        admin(),
        nextCookies()
        // keep this last in `plugins` array
    ]
});
