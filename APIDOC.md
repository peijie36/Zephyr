# *Zephyr* API Documentation
*The Zephyr API provides a set of endpoints for managing an e-commerce clothing store, including item display, user authentication, cart management, and order processing.*

## *Display Items on Main Page*
**Request Format:** */items*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves a list of all items to display on the main view page.*

**Example Request:** */items*

**Example Response:**
```json
[
  {
    "id": 3,
    "name": "Classic Blue Denim Jacket",
    "description": "A timeless classic, this blue denim jacket is perfect for any casual outfit. Made from high-quality denim, it offers both style and durability.",
    "price": 19.99,
    "category": "Outerwear",
    "image_url": "http://example.com/blue-denim-jacket.jpg",
  }
]
```

**Error Handling:**

*If there is an error while getting all items, it will return 500 Internal Server Error*


## *Get Item Detail*
**Request Format:** */items/:itemId*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves information about a specific item.*

**Example Request:** */items/3*

**Example Response:**
```json
{
  "id": 3,
  "name": "Classic Blue Denim Jacket",
  "description": "A timeless classic, this blue denim jacket is perfect for any casual outfit. Made from high-quality denim, it offers both style and durability.",
  "price": 19.99,
  "category": "Outerwear",
  "image_url": "http://example.com/blue-denim-jacket.jpg",
}
```

**Error Handling:**

*If the item is not found, server returns a 404 not found error*

*If there is an error while getting item detail, it will return 500 Internal Server Error*



## *Login*
**Request Format:** */login*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Retrieves information on current logged in user*

**Example Request:** *POST /login*
```json
{
  "username": "johndoe",
  "password": "encrypted_password",
}
```

**Example Response:**
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "encrypted_password",
  "cart":
  {
    "items": [
      {
        "id": 3,
        "name": "Classic Blue Denim Jacket",
        "description": "A timeless classic, this blue denim jacket is perfect for any casual outfit. Made from high-quality denim, it offers both style and durability.",
        "price": 19.99,
        "category": "Outerwear",
        "image_url": "http://example.com/blue-denim-jacket.jpg",
        "order_date": "2023-04-15T14:30:00Z",
      }
    ],
    "total_price": 19.99
  },
  "purchase_history": [
    {
      "order_id": "789124",
      "items": [
        {
          "id": 3,
          "name": "Classic Blue Denim Jacket",
          "description": "A timeless classic, this blue denim jacket is perfect for any casual outfit. Made from high-quality denim, it offers both style and durability.",
          "price": 19.99,
          "category": "Outerwear",
          "image_url": "http://example.com/blue-denim-jacket.jpg",
          "quantity": 2
        },
      ],
      "order_date": "2023-04-15T14:30:00Z",
      "total_price": 39.98
    },
    {
      "order_id": "101112",
      "items": [
        {
          "id": 3,
          "name": "Classic Blue Denim Jacket",
          "description": "A timeless classic, this blue denim jacket is perfect for any casual outfit. Made from high-quality denim, it offers both style and durability.",
          "price": 19.99,
          "category": "Outerwear",
          "image_url": "http://example.com/blue-denim-jacket.jpg",
          "quantity": 4
        }
      ],
      "order_date": "2023-03-12T09:45:00Z",
      "total_price": 79.96
    }
  ]
}
```

**Error Handling:**

*If the user does not exist, the server responds with a 404 Not Found Error.*


## *Signup*
**Request Format:** */signup*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Adds a user to the userbase.*

**Example Request:** *POST /signup*
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "encrypted_password"
}
```

**Example Response:**
```json
{
  "status": "success",
  "message": "User successfully created.",
}
```

**Error Handling:**

*If the request body is invalid or missing, the server responds with a 400 Bad Request Error.*

*If a user with the same username or email already exists, the server responds with a 400 Bad Request Error.*

*If an error occurs while registering the user, the server responds with a 500 Internal Server Error.*


## *Add Item to Cart*
**Request Format:** */cart/add*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Adds an item to the current user's cart.*

**Example Request:** */cart/add*
```json
{
  "username": "johndoe",
  "id": 3,
}
```

**Example Response:**
```json
{
  "id": 3,
  "name": "Classic Blue Denim Jacket",
  "description": "A timeless classic, this blue denim jacket is perfect for any casual outfit. Made from high-quality denim, it offers both style and durability.",
  "price": 19.99,
  "category": "Outerwear",
  "image_url": "http://example.com/blue-denim-jacket.jpg"
}
```

**Error Handling:**

*If the user is not logged in, the server returns a 401 unauthorized error*

*If the item is not found, the server returns a 404 Not Found Error*

*If there is an error from the server while adding an item, it will send a 500 Internal Server Error*


## *Search and filter through available items*
**Request Format:** */items/search?search={query}&category={category}*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Allows a user to search and filter items based on selected filters and queries.*

**Example Request:** */items/search?search=jacket&category=outerwear*

**Example Response:**
```json
[
  {
    "id": 3,
    "name": "Classic Blue Denim Jacket",
    "description": "A timeless classic, this blue denim jacket is perfect for any casual outfit. Made from high-quality denim, it offers both style and durability.",
    "price": 19.99,
    "category": "Outerwear",
    "image_url": "http://example.com/blue-denim-jacket.jpg",
  }
  ...
]
```

**Error Handling:**

*If there is an error from the server, it will send a 500 Internal Server Error*


## *User checks out cart*
**Request Format:** */cart/checkout*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Allows a user to checkout a cart with multiple items.*

**Example Request:** *POST /cart/checkout*
```json
{
  "username": "johndoe",
  "items": [
    {
      "id": 3,
      "quantity": 2
    }
  ],
  "total": 39.98
}
```

**Example Response:**
```json
{
  "status": "success",
  "message": "Thank you for your payment. Your order has been confirmed!",
}
```

**Error Handling:**

*If the user is not logged in, the server returns a 401 unauthorized error*

*If user's cart is empty, clicking on checkout will result in a 400 bad request error*

*Error occurred on the server while processing the checkout will send a 500 Internal Server Error*


## *Purchase History*
**Request Format:** */users/{username}/transactions*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves all previous transactions for a specific user*

**Example Request:** *GET /users/johndoe/transactions*

**Example Response:**
```json
{
  {
    "order_id": "789124",
    "username": "johndoe",
    "items": "2\n1\n2",
    "order_date": "2023-04-15T14:30:00Z",
    "total_price": 39.98
  },
  {
    "order_id": "789124",
    "username": "johndoe",
    "items": "2\n1\n2",
    "order_date": "2023-04-15T14:30:00Z",
    "total_price": 39.98
  }
}
```

**Error Handling:**
*If a person isn't logged in and requests the purchase history, the server responds with a 401 Unauthorized error.*
