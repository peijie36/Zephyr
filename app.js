/*
 * Name: Scott Nguyen
 * Date: 5/28/2024
 * Section: CSE 154 AB - Elias Belzberg, Quinton Pharr
 *
 * This file contains the backend services for the Zephyr ecommerce site.
 * It handles requests to fetch items, search for items, filter items by categories,
 * user login/signup, add items to cart, make a purhcase, and access previous
 * transactions.
 */

"use strict";

const express = require("express");
const app = express();

const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const multer = require("multer");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

// Retrieves all items to display on the main view page
app.get("/items", async (req, res) => {
  try {
    const db = await getDBConnection();
    let query;
    let results;
    query = "SELECT * FROM items";
    results = await db.all(query);
    await db.close();
    res.json(results);
  } catch (err) {
    res.type("text");
    res.status(500).send("Internal Server Error.");
  }
});

// Search items route
app.get("/items/search", async (req, res) => {
  try {
    const search = req.query.search;
    const category = req.query.category;
    let querySearch = "SELECT * FROM items WHERE 1=1";
    const queryParams = [];
    if (search) {
      querySearch += " AND (name LIKE ? OR description LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      querySearch += " AND category = ?";
      queryParams.push(category);
    }
    const db = await getDBConnection();
    const filteredItems = await db.all(querySearch, queryParams);
    await db.close();
    res.json(filteredItems);
  } catch (err) {
    res.status(500).send("Internal Server Error.");
  }
});

// Retrieves information about a specific item
app.get("/items/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const db = await getDBConnection();
    const query = "SELECT * FROM items WHERE id = ?";
    const result = await db.get(query, [itemId]);
    await db.close();
    if (result) {
      res.json(result);
    } else {
      res.type("text");
      res.status(404).send("Item not found");
    }
  } catch (err) {
    res.type("text");
    res.status(500).send("Internal Server Error.");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const {username, password} = req.body;
    const db = await getDBConnection();
    const query = "SELECT * FROM users WHERE username = ?";
    const user = await db.get(query, [username]);
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!user) {
      res.type("text");
      res.status(404).send("User not found");
    } else if (!passwordMatch) {
      res.type("text");
      res.status(401).send("Invalid credentials");
    } else {
      res.cookie("username", user.username);
      await db.close();
      res.json(user);
    }
  } catch (err) {
    res.type("text");
    res.status(500).send("Internal Server Error.");
  }
});

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const {username, email, password} = req.body;
    if (!username || !email || !password) {
      res.type("text");
      res.status(400).send("Invalid or missing credentials");
    } else {
      const db = await getDBConnection();
      const existingUser = await db.get("SELECT * FROM users WHERE username = ?", username);
      const existingEmail = await db.get("SELECT * FROM users WHERE email = ?", email);
      if (existingUser) {
        res.type("text");
        res.status(400).send("Username already exists");
      } else if (existingEmail) {
        res.type("text");
        res.status(400).send("Email already exists");
      } else {
        const hashedPass = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        await db.run(query, [username, email, hashedPass]);
        await db.close();
        res.cookie("username", username);
        res.json({status: "success", message: "User successfully created"});
      }
    }
  } catch (err) {
    res.type("text");
    res.status(500).send("Internal Server Error.");
  }
});

// Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.json({status: "success", message: "User logged out"});
});

// Add an item to cart Route
app.post("/cart/add", async (req, res) => {
  try {
    let db;
    const {username, itemId} = req.body;
    if (!username) {
      res.type("text");
      res.status(401).send("Not logged in!");
    } else {
      db = await getDBConnection();
      const querySearch = "SELECT * FROM items WHERE id = ?";
      const itemToAdd = await db.get(querySearch, [itemId]);
      if (itemToAdd.capacity <= 0) {
        await db.close();
        res.type("text");
        res.status(404).send("This item is out of stock!");
      } else {
        const updateQuantityQuery = "UPDATE items SET capacity = ? WHERE id = ?";
        await db.exec(updateQuantityQuery, [itemToAdd.capacity - 1, itemId]);
        await db.close();
        res.json(itemToAdd);
      }
    }
  } catch (err) {
    res.status(500).send("Internal Server Error.");
  }
});

// Checkout Route
app.post("/cart/checkout", async (req, res) => {
  try {
    const {username, items, total} = req.body;
    if (!username) {
      res.type("text");
      res.status(401).send("Must be logged in to purchase items.");
    } else if (!items.length > 0) {
      res.type("text");
      res.status(400).send("Must have an item in cart.");
    } else {
      const db = await getDBConnection();
      const query = "INSERT INTO purchase_history (username, items, total_price) VALUES (?, ?, ?)";
      await db.run(query, [username, items, total]);
      await db.close();
      res.json({
        status: "success",
        message: "Thank you for your payment. Your order has been confirmed!"
      });
    }
  } catch (err) {
    res.type("text");
    res.status(500).send("Internal Server Error.");
  }
});

// Get user transactions
app.get("/users/:username/transactions", async (req, res) => {
  try {
    const {username} = req.params;
    const db = await getDBConnection();
    const querySearch = "SELECT * FROM purchase_history WHERE username = ?";
    const transactions = await db.all(querySearch, [username]);
    await db.close();
    res.json(transactions);
  } catch (err) {
    res.type("text");
    res.status(500).send("Internal Server Error.");
  }
});

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "zephyr.db",
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static("public"));

const portNumber = 8000;
const PORT = process.env.PORT || portNumber;
app.listen(PORT);
