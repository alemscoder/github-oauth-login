/* Libs imports */
import { html, render } from "lit-html"
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js"
import "@shoelace-style/shoelace/dist/components/input/input.js"
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js"
/* Components imports */
import { toastNotification } from "./toastNotification.js"

class FilesModal {

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
        #fileUpload::part(base) {
          border: none;
        }
        #fileUpload::part(input) {
          padding: 0;
          margin-top: 7px;
        }
      </style>
      <sl-dialog id="uploadFilesModal" label="Upload files" style="--width: 25rem;">
        <form method="post" id="formUploadFiles">
          <sl-input id="repositoryName" name="repo-name" label="Repository Name" type="text" autofocus required></sl-input>
          <sl-input id="filePath" name="file-path" label="Directory Name" type="text" required disabled></sl-input>
          <sl-input id="commitTitle" name="commit-title" label="Commit Title" type="text" required></sl-input>
          <sl-input id="fileUpload" name="file-upload" label="Select one or more files" type="file" multiple required></sl-input>
          <sl-checkbox id="createDir" name="create-dir">Create Directory</sl-checkbox>
          <div class="btn-form">
            <sl-button id="cancelFilesBtn" type="button" slot="footer" variant="danger" outline>Cancel</sl-button>
            <sl-button id="uploadFilesBtn" type="submit" slot="footer" variant="success" outline>Upload</sl-button>
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
    this.uploadFilesModal = document.querySelector("#uploadFilesModal")
    this.formUploadFiles = document.querySelector("#formUploadFiles")
    this.cancelFilesBtn = document.querySelector("#cancelFilesBtn")
    this.fileUpload = document.querySelector("#fileUpload")
    this.createDir = document.querySelector("#createDir")
    this.filePath = document.querySelector("#filePath")

    /* Events listeners */
    this.cancelFilesBtn.addEventListener("click", this.hideModal)
    this.createDir.addEventListener("click", this.createDirectory)
    this.formUploadFiles.addEventListener("submit", this.sendDataForm)
  }

  /* Class method: showModal */
  showModal() {
    /* A read-only promise that resolves when the 
    component has finished updating. */
    this.uploadFilesModal.updateComplete.then(() => {
      this.uploadFilesModal.show()
      /* Select the input element inside the shadow DOM */
      const files = this.fileUpload.shadowRoot.querySelector("#input")
      files.multiple = true
    })
  }

  /* Class method: Use an arrow function to bind 'this' since arrow 
	functions keep the 'this' context from where they were defined. */
  hideModal = () => {
    this.uploadFilesModal.hide()
  }

  /* Class method: removeEventListeners */
  removeEventListeners() {
    this.cancelFilesBtn.removeEventListener("click", this.hideModal)
    this.createDir.removeEventListener("click", this.createDirectory)
    this.formUploadFiles.removeEventListener("submit", this.sendDataForm)
  }

  /* Class method: Handle the enable/disable of the input
	that allow create a directory in the user repo */
  createDirectory() {
    if (createDir.checked) {
      filePath.removeAttribute("disabled")
    } else {
      filePath.setAttribute("disabled", "")
    }
  }

  /* Class method: Read the file content after upload */
  readFileContent(fileList) {
    let filePromises = Array.from(fileList).map((file) => {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = (event) => {
          let content = event.target.result
          let decodedContent = atob(content.replace(/^(.+,)/, ""))
          resolve({ content: decodedContent, filename: file.name })
        }
        reader.onerror = (event) => {
          reject(event.target.error)
        }
        reader.readAsDataURL(file)
      })
    })
    return Promise.all(filePromises)
  }

  /* Class method: sendDataForm */
  async sendDataForm(event) {
    event.preventDefault()
    /* Set to disabled the action button and show the loader */
    const uploadFilesBtn = document.querySelector("#uploadFilesBtn")
    uploadFilesBtn.setAttribute("disabled", "")
    uploadFilesBtn.setAttribute("loading", "")
    /* Define details of the request */
    const storedUserData = JSON.parse(localStorage.getItem("userData"))
    const headers = {
      "Accept": "application/vnd.github+json",
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    }
    const owner = storedUserData.login
    const repositoryName = document.querySelector("#repositoryName").value
    const commitTitle = document.querySelector("#commitTitle").value
    const files = this.fileUpload.shadowRoot.querySelector("#input").files
    const filePromises = this.readFileContent(files)
    try {
      const filesData = await filePromises
      /* Store the result of the http code status of each iteration of the for loop */
      let successCount = 0
      let fileUpdateCount = 0
      let fileCreateCount = 0
      let invalidDirName = 0
      let errorCount = 0
      let badCredentials = 0
      /* Loop for every request */
      for (const file of filesData) {
        const { content, filename } = file
        let file_path = filename
        // condition to concatenate the entry directory value to the file
        // name to make the full path if create dir bolean is checked
        if (createDir.checked) {
          file_path = this.filePath.value + "/" + filename
        }
        /* Create request for check if file exist */
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repositoryName}/contents/${file_path}`,
          {
            headers: headers,
          }
        )
        /* If file exist then get the sha for update the file */
        let sha = null
        if (response.status === 200) {
          const data = await response.json()
          sha = data.sha
        }
        /* Create request to create or update the file */
        const putResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repositoryName}/contents/${file_path}`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({
              message: commitTitle,
              content: btoa(content),
              sha: sha,
            }),
          }
        )
        /* If putResponse.ok = true then capture http 
        code and increment variable of the cicle */
        if (putResponse.ok) {
          successCount++
          if (putResponse.status === 200) {
            fileUpdateCount++
          } else if (putResponse.status === 201) {
            fileCreateCount++
          } 
        }
        /* If putResponse.ok = false then capture http 
        code and increment variable of the cicle */
        if (!putResponse.ok) {
          if (putResponse.status === 422) {
            invalidDirName++
          } else if (putResponse.status === 401) {
            badCredentials++
          }
          else {
            errorCount++
          }
        }
      }
      /* Build and show success message toast if 
      putResponse.ok = true and http code match */
      if (successCount > 0) {
        let notificationMessage = ""   
        if (fileUpdateCount > 0) {
          notificationMessage += `${fileUpdateCount} file(s) updated.`
        }      
        if (fileCreateCount > 0) {
          notificationMessage += `${fileCreateCount} file(s) created.`
        }      
        toastNotification(notificationMessage.trim())
      }
      /* Build and show invalid message toast if 
      putResponse.ok = false and http code match */
      if (invalidDirName > 0) {
        toastNotification("Invalid directory name.")
      }    
      if (errorCount > 0) {
        toastNotification("Repository name not found.")
      }
      if (badCredentials > 0) {
        toastNotification("Session token has expired or is invalid, please log in again.")
      }
      /* Restore the initial state of the action button,
      hide the modal and remove the event listeners */
      uploadFilesBtn.removeAttribute("disabled")
      uploadFilesBtn.removeAttribute("loading")
      this.hideModal()
      this.removeEventListeners()
    } catch (error) {
      if (error.message === "Failed to fetch") {
        toastNotification("Connection error, could not access the server.")
        console.error("Connection error, could not access the server.", error)
      } else {
        toastNotification("Error making request to server.")
        console.error("Error making request to server.", error)
      }
      throw error
    }
  }

}

export { FilesModal }