CREATE TABLE "dreams" (
	"id" serial PRIMARY KEY NOT NULL,
	"interpretation" text NOT NULL,
	"content" text NOT NULL,
	"date_key" text NOT NULL,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_interpreted" boolean DEFAULT false NOT NULL
);
