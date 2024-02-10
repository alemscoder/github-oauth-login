/* Libs imports */
import {html, render} from "lit-html"
import "@shoelace-style/shoelace/dist/components/alert/alert.js"

export function ToastNotification(message) {

  /* Container for storing a reference of the 
  alert and reusing the toast() method */
  const toastContainer = document.createElement("div")
  toastContainer.setAttribute("class", "toast-container")
  document.body.appendChild(toastContainer)

  /* Template of the component */
  const template = html`
    <style>
      .sl-toast-stack {
        bottom: 0;
        top:auto;
      }
      sl-alert::part(icon) {
        font-size: 2rem;
      }
    </style>
    <sl-alert id="toastNotification" variant="neutral" duration="3000" closable>
      <sl-icon slot="icon" name="github"></sl-icon>
      <strong>${message}</strong>
    </sl-alert>
  `
  /* Lit HTML render function */
  render(template, toastContainer)

  /* Storing a reference of the alert 
  and call the toast() method */
  const toastNotification = toastContainer.querySelector("#toastNotification")
  toastNotification.toast()

  /* Observer for remove the toast container from the DOM 
  when the .sl-toast-stack leave the DOM */
  const targetNode = document.body
  /* Options for the MutationObserver (observe changes 
  in child nodes and subtree) */
  const observerOptions = { childList: true, subtree: true }
  /* Callback function to execute when a mutation is observed */
  const callback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      /* Check if a child node has been removed and if 
      it contains the 'sl-toast-stack' class */
      if (
        mutation.type === "childList" &&
        Array.from(mutation.removedNodes).some((node) =>
          node.classList?.contains("sl-toast-stack"),
        )
      ) {
        /* Remove the '.toast-container' element from the DOM if present */
        const toastContainer = document.querySelector(".toast-container")
        toastContainer?.remove()
      }
    }
  }
  /* Create a new instance of MutationObserver 
  with the callback function and options */
  const observer = new MutationObserver(callback)
  /* Start observing the target node 
  with the specified options */
  observer.observe(targetNode, observerOptions)

}