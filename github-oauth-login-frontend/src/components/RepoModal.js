/* Libs imports */
import { html, render } from "lit-html"
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js"
import "@shoelace-style/shoelace/dist/components/input/input.js"
import "@shoelace-style/shoelace/dist/components/radio/radio.js"
import "@shoelace-style/shoelace/dist/components/radio-group/radio-group.js"
/* Components imports */
import { ToastNotification } from "./ToastNotification.js"

class RepoModal {

  /* Class method: constructor */
  constructor() {
    this.template = html`
    <style>
      sl-dialog > form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .btn-form {
        display: flex;
        justify-content: flex-end;
        gap: 5px;
      }
    </style>
    <sl-dialog id="newRepoModal" label="Create a new repository" style="--width: 25rem;">
      <form method="post" id="formNewRepo">
        <sl-input id="repoName" name="repo-name" label="Name" type="text" autofocus required></sl-input>
        <sl-input id="repoUrl" name="repo-url" label="URL" type="url"></sl-input>
        <sl-input id="repoDescription" name="repo-desc" label="Description" type="text"></sl-input>
        <sl-radio-group name="privacity" value="false">
          <sl-radio id="repoPublic" value="false">Public</sl-radio>
          <sl-radio id="repoPrivate" value="true">Private</sl-radio>
        </sl-radio-group>
        <div class="btn-form">
          <sl-button id="cancelRepoBtn" type="button" slot="footer" variant="danger" outline>Cancel</sl-button>
          <sl-button id="createRepoBtn" type="submit" slot="footer" variant="success" outline>Create</sl-button>
        </div>
      </form>
    </sl-dialog>
    `
    /* Lit HTML render function */
    render(this.template, document.body)

		/* Bind 'this' context to the sendDataForm() to 
    recognize functions in their context */
    this.sendDataForm = this.sendDataForm.bind(this)

    /* Elements reference */
    this.newRepoModal = document.querySelector("#newRepoModal")
    this.formNewRepo = document.querySelector("#formNewRepo")
    this.cancelRepoBtn = document.querySelector("#cancelRepoBtn")

    /* Events listeners */
    this.cancelRepoBtn.addEventListener("click", this.hideModal)
    /* Note to investigate: If I bind the event '@submit=${this.sendDataForm}'
    to the <form> node and comment the line that call 'this.removeEventListeners()', 
    the function is executed without respecting the required attribute of 
    the form fields (as if the <form> had the 'novalidate' attribute) 🤷🏻‍♂️ */
    this.formNewRepo.addEventListener("submit", this.sendDataForm)
  }

  /* Class method: showModal */
  showModal() {
    /* A read-only promise that resolves when the 
    component has finished updating. */
    this.newRepoModal.updateComplete.then(() => {
      this.newRepoModal.show()
    })
  }

  /* Class method: Use an arrow function to bind 'this' since arrow 
	functions keep the 'this' context from where they were defined. */
  hideModal = () => {
    this.newRepoModal.hide()
  }

	/* Class method: removeEventListeners */
  removeEventListeners() {
    this.cancelRepoBtn.removeEventListener("click", this.hideModal)
    this.formNewRepo.removeEventListener("submit", this.sendDataForm)
  }

  /* Handle error message based on response code */
  handleErrorMessage(response) {
    if (!response.ok) {
      /* Parse the response */
      return response.json()
      .then((data) => {
        /* Show the message of the error */
        if (data.errors.message) {
          ToastNotification(data.errors.message)
          /* If response have a list of errors then find a error that
          contain a message for show that message */
        } else if (data.errors && data.errors.length > 0) {
          const error = data.errors.find((error) => error.message)
          if (error) {
            ToastNotification(error.message)
          } else {
            ToastNotification("Unknown error.")
          }
        } else {
          ToastNotification("Unknown error.")
        }
      })
      .catch((error) => {
        ToastNotification("Error parsing response:", error)
      })
    }
  }

  /* Class method: sendDataForm */
  async sendDataForm(event) {
    event.preventDefault()
    /* Set to disabled the action button and show the loader */
    const createRepoBtn = document.querySelector("#createRepoBtn")
    createRepoBtn.setAttribute("disabled", "")
    createRepoBtn.setAttribute("loading", "")
    /* Define details of the request */
    const headers = {
      "Accept": "application/vnd.github+json",
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    }
    const repoName = document.querySelector("#repoName").value
    const repoUrl = document.querySelector("#repoUrl").value
    const repoDescription = document.querySelector("#repoDescription").value
    const repoPrivate = document.querySelector("#repoPrivate").checked
    /* Create request for the new repo */
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          name: repoName,
          homepage: repoUrl,
          description: repoDescription,
          private: repoPrivate,
        }),
      })
      /* Case of http response status codes */
      switch (response.status) {
        case 201:
          ToastNotification("Repository created successfully.")
          break
        case 304:
          await this.handleErrorMessage(response)
          break
        case 400:
          await this.handleErrorMessage(response)
          break
        case 401:
          ToastNotification("Session token has expired or is invalid, please log in again.")
          break
        case 403:
          await this.handleErrorMessage(response)
          break
        case 404:
          await this.handleErrorMessage(response)
          break
        case 422:
          await this.handleErrorMessage(response)
          break
        default:
          ToastNotification("Unexpected status code.")
          break
      }
      /* Restore the initial state of the action button,
      hide the modal and remove the event listeners */
      createRepoBtn.removeAttribute("disabled")
      createRepoBtn.removeAttribute("loading")
      this.hideModal()
			this.removeEventListeners()
    } catch (error) {
      if (error.message === "Failed to fetch") {
        ToastNotification("Connection error, could not access the server.")
        console.error("Connection error, could not access the server.", error)
      } else {
        ToastNotification("Error making request to server.")
        console.error("Error making request to server.", error)
      }
      throw error
    }
  }

}

export { RepoModal }