"use strict";

/*
 * Name: Scott Nguyen
 * Date: 04/18/2024
 * Section: CSE 154 AB - Elias Belzberg, Quinton Pharr
 *
 * This is the JS file that handles the authentication logic for our project.
 */

(function() {
  window.addEventListener("load", init);

  /**
   * Initializes the page with event listeners for authentication
   */
  function init() {
    qsa(".swap a").forEach(function(link) {
      link.addEventListener("click", swapAuth);
    });
    id("login-btn").addEventListener("click", login);
    id("signup-btn").addEventListener("click", signup);
  }

  /**
   * Toggles between sign up and login forms.
   * @param {Event} event - The click event object.
   */
  function swapAuth(event) {
    event.preventDefault();
    const forms = document.querySelectorAll(".form-box");

    forms.forEach(function(form) {
      form.classList.toggle("hidden");
    });
  }

  /**
   * Handles the login process by sending user credentials to the server.
   * @param {Event} event - The click event object.
   * @async
   * @throws {Error} If the login request fails.
   */
  async function login(event) {
    event.preventDefault();
    const username = id("username").value;
    const password = id("password").value;
    try {
      const data = new FormData();
      data.append("username", username);
      data.append("password", password);
      const response = await fetch("/login", {
        method: "POST",
        body: data
      });
      await statusCheck(response);
      const user = await response.json();
      if (user) {
        window.location.href = "/index.html";
      }
    } catch (error) {
      handleError(error, "login");
    }
  }

  /**
   * Handles the signup process by sending new user details to the server.
   * @param {Event} event - The click event object.
   * @async
   * @throws {Error} If the signup request fails.
   */
  async function signup(event) {
    event.preventDefault();
    const username = id("signup-username").value;
    const email = id("email").value;
    const password = id("signup-password").value;
    try {
      const data = new FormData();
      data.append("username", username);
      data.append("email", email);
      data.append("password", password);
      const response = await fetch("/signup", {
        method: "POST",
        body: data
      });
      await statusCheck(response);
      await response.json();
      window.location.href = "/index.html";
    } catch (error) {
      handleError(error, "signup");
    }
  }

  /**
   * Checks the status of a fetch response.
   * @param {Response} res - The response object to check.
   * @returns {Promise<Response>} The response object.
   * @throws {Error} If the response is not OK.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Handles errors by displaying an error message in the specified part of the form.
   * @param {Error} error - The error object.
   * @param {string} part - The part of the form where the error occurred ("login" or "signup").
   */
  function handleError(error, part) {
    const idDiv = "error-" + part;
    const errorElement = id(idDiv);
    errorElement.innerHTML = "";
    const errorMessage = gen("p");
    errorMessage.textContent = error + ". Try Again.";
    errorMessage.classList.add("error-msg");
    errorElement.appendChild(errorMessage);

    setTimeout(() => {
      errorElement.innerHTML = "";
    }, 3000);
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
   * Utility function to select all DOM elements matching a CSS selector.
   * @param {string} selector - The CSS selector to match against.
   * @returns {NodeList<HTMLElement>} A list of DOM elements that match the selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();

