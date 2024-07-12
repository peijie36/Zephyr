/*
 * Name: Scott Nguyen & Peijie Zheng
 * Date: 5/4/2024
 * Section: CSE 154 AB - Elias Belzberg, Quinton Pharr
 *
 * This is the JS file that handles the main home page. Showing the available items
 * alongside filters, search bar, and a toggle between grid and list views.
 */

"use strict";
(function() {
  let currentLayout = "block";

  window.addEventListener("load", init);

  /**
   * Initializes the page by rendering a list of items.
   */
  function init() {
    let user = checkUsernameCookie();
    updateStatus(user);
    fetchItems();
    qs("#search-bar input[type='search']").addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        handleSearch();
      }
    });
    id("search-btn").addEventListener("click", handleSearch);
    id("all-btn").addEventListener("click", updateFilters);
    id("shirts-btn").addEventListener("click", updateFilters);
    id("pants-btn").addEventListener("click", updateFilters);
    id("outer-btn").addEventListener("click", updateFilters);
    id("acc-btn").addEventListener("click", updateFilters);
    id("list").addEventListener("click", updateLayout);
    id("block").addEventListener("click", updateLayout);
  }

  /**
   * Retrieves all items from the server and displays them.
   *
   * @async
   * @function fetchItems
   */
  async function fetchItems() {
    try {
      let res = await fetch("/items");
      await statusCheck(res);
      res = await res.json();
      displayItems(res);
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
   * Updates the user status based on login status.
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
   * Logs out the user by making a request to the server.
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
   * Renders items on the page.
   * @param {Array} items - An array of items to display.
   */
  function displayItems(items) {
    id("items-container").innerHTML = "";
    items.forEach((item) => {
      let itemDiv = gen("div");
      if (currentLayout === "block") {
        itemDiv.classList.add("item-block");
      } else {
        itemDiv.classList.add("item-list");
      }
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
      itemDetail.appendChild(itemImage);
      itemDetail.appendChild(itemName);
      itemDetail.appendChild(itemPrice);
      itemDiv.appendChild(itemDetail);
      id("items-container").appendChild(itemDiv);
    });
  }

  /**
   * Fetches detailed product information from the server.
   * @param {string} itemId - The ID of the product to fetch.
   */
  async function fetchProductDetail(itemId) {
    try {
      let res = await fetch("/items/" + itemId);
      await statusCheck(res);
      res = await res.json();
      sessionStorage.setItem("productDetail", JSON.stringify(res));
      window.location.href = "product-detail.html";
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Handles the search functionality by retrieving the search query and search
   * for items that match the query.
   *
   * @async
   * @function handleSearch
   */
  async function handleSearch() {
    const searchQuery = qs("#search-bar input[type='search']").value;
    try {
      let res = await fetch("/items/search?search=" + searchQuery);
      await statusCheck(res);
      res = await res.json();
      displayItems(res);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Updates the filter buttons' active state based on the clicked button,
   * fetches and displays items based on the selected filter category.
   * If "All" is selected, retrieves all items. Handles any errors that occur
   * during the fetch operation.
   *
   * @async
   * @function updateFilters
   * @param {Event} event - The event object triggered by the filter button click.
   */
  async function updateFilters(event) {
    const target = event.target;
    if (target.tagName === "BUTTON") {
      const filterButtons = Array.from(qsa("#filter-btns button"));
      filterButtons.forEach(button => button.classList.remove("active"));
      target.classList.add("active");
    }
    try {
      if (target.textContent === "All") {
        await fetchItems();
      } else {
        const category = encodeURIComponent(target.textContent);
        let res = await fetch("/items/search?category=" + category);
        await statusCheck(res);
        res = await res.json();
        displayItems(res);
      }
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Updates the layout between grid and list views.
   * @param {Event} event - The click event object.
   */
  function updateLayout(event) {
    const target = event.target;
    if (target.tagName === "IMG") {
      const filterImgs = Array.from(qsa("#format button img"));
      filterImgs.forEach(button => button.classList.remove("active"));
      target.classList.add("active");
    }

    const container = id("items-container");
    const divs = container.querySelectorAll("div");
    if (target.id === "block") {
      currentLayout = "block";
      container.classList = "block";
      divs.forEach(div => {
        div.className = "item-block";
      });
    } else {
      currentLayout = "list";
      container.classList = "list";
      divs.forEach(div => {
        div.className = "item-list";
      });
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
   * Utility function to select the first DOM element matching a CSS selector.
   * @param {string} selector - The CSS selector to match against.
   * @returns {HTMLElement} The first DOM element that matches the selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Utility function to select all DOM elements matching a CSS selector.
   * @param {string} selector - The CSS selector to match against.
   * @returns {NodeList<HTMLElement>} A list of DOM elements that match the selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
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

