CREATE TABLE "items" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"description"	TEXT,
	"price"	REAL NOT NULL,
	"category"	TEXT NOT NULL,
	"image_url"	TEXT NOT NULL,
	"gender"	TEXT NOT NULL,
	"capacity"	INTEGER NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE "purchase_history" (
	"order_id"	INTEGER,
	"username"	TEXT NOT NULL,
	"items"	TEXT NOT NULL,
	"order_date"	DATETIME DEFAULT (datetime('now', 'localtime')),
	"total_price"	REAL NOT NULL,
	PRIMARY KEY("order_id" AUTOINCREMENT),
	FOREIGN KEY("username") REFERENCES "users"("username")
);

CREATE TABLE "users" (
	"user_id"	INTEGER,
	"username"	TEXT NOT NULL UNIQUE,
	"email"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	PRIMARY KEY("user_id" AUTOINCREMENT)
);