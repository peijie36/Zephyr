/*
 * Name: Scott Nguyen & Peijie Zheng
 * Date: 5/4/2024
 * Section: CSE 154 AB - Elias Belzberg, Quinton Pharr
 *
 * This is the JS file that handles the cart interactions. Displaying current cart and
 * previous transactions.
 */

"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * Initializes the page by rendering a list of items in cart.
   */
  function init() {
    let user = checkUsernameCookie();
    updateStatus(user);
    id("checkout-btn").removeEventListener("click", checkout);
    id("clear-cart").addEventListener("click", clearCart);
    if (user) {
      id("cart-items").innerHTML = "";
      const cartItems = JSON.parse(localStorage.getItem("cart"));
      if (cartItems) {
        fetchCart(cartItems);
      } else {
        const noItems = gen("p");
        noItems.textContent = "No items in cart.";
        id("cart-items").appendChild(noItems);
        id("checkout-btn").disabled = true;
      }
      id("checkout-btn").addEventListener("click", checkout);
      fetchOrderHistory();
    } else {
      id("checkout-btn").disabled = true;
    }
  }

  /**
   * Clears all items from the cart by removing them from local storage.
   */
  function clearCart() {
    localStorage.removeItem("cart");
    window.location.href = "/index.html";
  }

  /**
   * Fetches the items in the cart and displays them.
   * @param {Array} cartItems - An array of items in the cart.
   */
  function fetchCart(cartItems) {
    try {
      displayItems(cartItems);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Fetches the order history for the current user and displays it.
   */
  async function fetchOrderHistory() {
    const username = checkUsernameCookie();
    try {
      let res = await fetch("/users/" + username + "/transactions");
      await statusCheck(res);
      res = await res.json();
      displayOrderHistory(res);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Displays the order history on the page.
   * @param {Array} orders - An array of order objects.
   */
  function displayOrderHistory(orders) {
    orders.forEach(displayOrder);
  }

  /**
   * Displays a single order in the order history.
   * @param {Object} order - The order object.
   */
  async function displayOrder(order) {
    const itemIDs = order.items.trim().split("\n");

    const transactionDiv = gen("div");
    transactionDiv.classList.add("transaction");

    const headerDiv = gen("div");
    headerDiv.classList.add("header");

    const orderInfoDiv = gen("div");
    orderInfoDiv.textContent = "Order placed: " + itemIDs.length;

    const orderTotalDiv = gen("div");
    orderTotalDiv.textContent = "Total: $" + order.total_price;

    const dateDiv = gen("div");
    dateDiv.textContent = "Date: " + order.order_date;

    headerDiv.appendChild(orderInfoDiv);
    headerDiv.appendChild(orderTotalDiv);
    headerDiv.appendChild(dateDiv);

    const itemsList = await createItemsList(itemIDs);
    transactionDiv.appendChild(headerDiv);
    transactionDiv.appendChild(itemsList);
    id("order-history").appendChild(transactionDiv);
  }

  /**
   * Creates and populates the list of items for an order.
   * @param {Array} itemIDs - An array of item IDs.
   * @returns {HTMLElement} The list of items for the order.
   */
  async function createItemsList(itemIDs) {
    const itemsList = gen("ul");
    itemsList.classList.add("items-list");

    for (const itemID of itemIDs) {
      try {
        const item = await fetchItem(itemID);
        const itemLi = gen("li");
        itemLi.classList.add("order-item");

        const itemImage = gen("img");
        itemImage.src = item.image_url;

        const nameSpan = gen("span");
        nameSpan.classList.add("name");
        nameSpan.textContent = item.name;

        const priceSpan = gen("span");
        priceSpan.classList.add("price");
        priceSpan.textContent = `$${item.price}`;

        itemLi.appendChild(itemImage);
        itemLi.appendChild(nameSpan);
        itemLi.appendChild(priceSpan);

        itemsList.appendChild(itemLi);
      } catch (err) {
        handleError(err);
      }
    }

    return itemsList;
  }

  /**
   * Fetches an item by its ID from the server.
   * @param {string} itemId - The ID of the item to fetch.
   * @returns {Object} The item object fetched from the server.
   */
  async function fetchItem(itemId) {
    try {
      let res = await fetch("/items/" + itemId);
      await statusCheck(res);
      res = await res.json();
      return res;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Retrieves the username from the cookie.
   * @returns {string} The username retrieved from the cookie.
   */
  function checkUsernameCookie() {
    let username = document.cookie.split("=")[1];
    return username;
  }

  /**
   * Updates the user status on the page by adding logout button if logged in.
   * @param {string} user - The username of the logged-in user.
   */
  function updateStatus(user) {
    const status = id("user-status");
    if (status.children.length === 2) {
      status.removeChild();
    }
    if (user) {
      const logout = gen("button");
      logout.textContent = "Logout";
      logout.addEventListener("click", logoutUser);

      status.appendChild(logout);
    } else {
      const login = gen("button");
      login.textContent = "Login";
      login.addEventListener("click", function() {
        window.location.href = "/auth.html";
      });

      status.appendChild(login);
    }
  }

  /**
   * Logs out the current user by sending a request to the server.
   */
  async function logoutUser() {
    try {
      const response = await fetch("/logout", {
        method: "POST"
      });
      await statusCheck(response);
      window.location.href = "/index.html";
    } catch (error) {
      handleError("Logout failed:", error);
    }
  }

  /**
   * Displays the items in the cart on the page.
   * @param {Array} items - An array of items to display in the cart.
   */
  function displayItems(items) {
    let totalPrice = 0;
    items.forEach((item) => {
      let itemDiv = gen("div");
      itemDiv.classList.add("item");
      let itemDetail = gen("a");
      let itemImage = gen("img");
      itemImage.src = item.image_url;
      itemImage.addEventListener("click", function() {
        fetchProductDetail(item.id);
      });
      let itemName = gen("p");
      itemName.textContent = item.name;
      let itemPrice = gen("p");
      itemName.classList.add("bold");
      itemPrice.textContent = "$" + item.price;
      totalPrice += item.price;
      itemDetail.appendChild(itemImage);
      itemDetail.appendChild(itemName);
      itemDetail.appendChild(itemPrice);
      itemDiv.appendChild(itemDetail);
      id("cart-items").appendChild(itemDiv);
    });
    id("subtotal").textContent = "$" + totalPrice;
    id("total").textContent = "$" + totalPrice;
  }

  /**
   * Fetches detailed information about a product from the server.
   * @param {string} itemId - The ID of the product to fetch.
   */
  async function fetchProductDetail(itemId) {
    try {
      let res = await fetch("/items/" + itemId);
      await statusCheck(res);
      res = await res.json();
      sessionStorage.setItem("productDetail", JSON.stringify(res));
      window.location.href = "/product-detail.html";
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Processes the checkout by sending a request to the server.
   */
  async function checkout() {
    try {
      let username = checkUsernameCookie();
      const cartItems = JSON.parse(localStorage.getItem("cart"));
      let totalPrice = 0;
      let items = "";
      cartItems.forEach(item => {
        items += item.id + "\n";
        totalPrice += item.price;
      });
      const data = new FormData();
      data.append("username", username);
      data.append("items", items);
      data.append("total", totalPrice);
      const response = await fetch("/cart/checkout", {
        method: "POST",
        body: data
      });
      await statusCheck(response);
      localStorage.removeItem("cart");
      window.location.href = "/index.html";
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Utility function to create a DOM element.
   * @param {string} tag - The tag name of the element to create.
   * @returns {HTMLElement} The created DOM element.
   */
  function gen(tag) {
    return document.createElement(tag);
  }

  /**
   * Utility function to get a DOM element by ID.
   * @param {string} id - The ID of the element to retrieve.
   * @returns {HTMLElement} The DOM element with the specified ID.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Checks if the status of the response returns okay.
   * @param {Response} response - The response object.
   * @returns {Response} The response object.
   * @throws {Error} Throws an error if the response status is not okay.
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  /**
   * Handles errors by displaying an error message in the specified part of the form.
   * @param {Error} err - The error object.
   */
  function handleError(err) {
    const errorContainer = id("error");
    const errorMessage = gen("p");
    errorMessage.textContent = err.message;
    errorMessage.classList.add("error-msg");
    errorContainer.appendChild(errorMessage);

    setTimeout(() => {
      errorContainer.innerHTML = "";
    }, 3000);
  }
})();

