/*
 * This is the JS file that handles the product details page. It shows the product
 * alongside all of the details associated with the item.
 */

"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * Initializes the page to render the product details
   */
  function init() {
    let user = checkUsernameCookie();
    updateStatus(user);
    loadItemDetail();
    id("add-to-cart").addEventListener("click", updateCart);
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
   * Updates the user status on the page based on whether the user is logged in.
   * @param {string|null} user - The username if the user is logged in, otherwise null.
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

      id("add-to-cart").disabled = true;
    }
  }

  /**
   * Logs out the user by making a POST request to the server and redirecting to the home page.
   * @async
   * @throws {Error} Throws an error if the logout request fails.
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
   * Loads the item details from session storage and displays them on the page.
   */
  function loadItemDetail() {
    const itemDetail = JSON.parse(sessionStorage.getItem("productDetail"));
    id("title").textContent = itemDetail.name;
    id("category").textContent = itemDetail.category;
    id("price").textContent = "$" + itemDetail.price;
    const productImg = gen("img");
    productImg.id = "product-image";
    productImg.src = itemDetail.image_url;
    id("product").appendChild(productImg);
    const descriptions = itemDetail.description.split("\n");
    descriptions.forEach((description) => {
      const descList = gen("li");
      descList.textContent = description;
      id("descriptions").appendChild(descList);
    });
  }

  /**
   * Updates the cart by sending a request to add the current item and updating local storage.
   * @async
   * @throws {Error} Throws an error if the request to update the cart fails.
   */
  async function updateCart() {
    const itemDetail = JSON.parse(sessionStorage.getItem("productDetail"));
    const username = checkUsernameCookie();
    try {
      const data = new FormData();
      data.append("username", username);
      data.append("itemId", itemDetail.id);
      let res = await fetch("/cart/add", {
        method: "POST",
        body: data
      });
      await statusCheck(res);
      res = await res.json();
      await addItemToCart(res);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Adds the item to the cart in local storage and redirects to the home page.
   * @param {Object} item - The item to add to the cart.
   */
  function addItemToCart(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/index.html";
  }

  /**
   * Returns the element with the specified ID.
   * @param {string} id - The ID of the element.
   * @returns {HTMLElement} The element with the specified ID.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Creates and returns a new element with the specified tag name.
   * @param {string} element - The tag name of the element to create.
   * @returns {HTMLElement} A new element with the specified tag name.
   */
  function gen(element) {
    return document.createElement(element);
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

