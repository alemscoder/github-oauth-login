/* Libs imports */
import { LitElement, css, html } from "lit"
import "@shoelace-style/shoelace/dist/components/button/button.js"
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js"
import "@shoelace-style/shoelace/dist/themes/light.css"
/* Components & Assets imports */
import "./style.css"
import { getAccessToken, getUserData } from "./api-data.js"
import { toastNotification } from "./components/toastNotification.js"
import githubMark from "./assets/github-mark.svg"
import githubLogo from "./assets/GitHub_Logo.webp"
import authentication from "./assets/authentication.svg"
/* Global variables */
const OAUTH_URL = "https://github.com/login/oauth/authorize"
const REDIRECT_URI = process.env.REDIRECT_URI
const CLIENT_ID = process.env.CLIENT_ID
const SCOPE = "read:user repo"
const URL = `${OAUTH_URL}?client_id=${CLIENT_ID}&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}`

class GithubLogin extends LitElement {
  /* Lit reactive properties */
  static get properties() {
    return {
      code: { type: String },
      welcomeSection: { type: Boolean },
      btnSection: { type: Boolean },
      userData: {type: Object},
      loading: { type: Boolean },
      btnLoading: { type: Boolean }
    }
  }

  /* Class method: constructor */
  constructor() {
    super()
    this.code = ""
    this.welcomeSection = true
    this.btnSection = true
    this.userData = {}
    this.loading = false
    this.btnLoading = false
    
  }

  /* Class method: connectedCallback */
  async connectedCallback() {
    super.connectedCallback()
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    if (code) {
      this.code = code
      /* This function take as a second arg 'this' that allow
      use a instance of the class in the declared function. */
      await getAccessToken(code, this)
      /* Take the returned URL, split from "?" 
      and replace the entry in the history. */
      const newUrl = window.location.href.split("?")[0]
      history.replaceState(null, null, newUrl)
    }
    document.addEventListener("DOMContentLoaded", () => {
      this.loadUserDataFromLocalStorage()
    })
  }

  /* Class method: login */
  login() {
    window.location.href = URL
  }

  /* Class method: invalidAccessToken */
  invalidAccessToken() {
    this.loading = false
    this.btnSection = false
    this.welcomeSection = true
    const btnGetUserData = this.shadowRoot.querySelector("#btnGetUserData")
    if (btnGetUserData) {
      btnGetUserData.style.display = "none"
    }
    toastNotification("Session token has expired or is invalid, please log in again.")
  }

  /* Class method: manageUserData */
  async manageUserData() {
    /* Check access token */
    if (localStorage.getItem("accessToken") === null) {
      setTimeout(() => this.invalidAccessToken(), 2000)
      /* The user data is in the local storage */
    } else if (localStorage.getItem("userData") !== null) {
      const storedUserData = JSON.parse(localStorage.getItem("userData"))
      let serverData
      /* Save the data from the server for compare */
      serverData = await getUserData(this)
      if (serverData) {
        /* Compare the local storage data with the server data */
        if (
          serverData.public_repos !== storedUserData.public_repos ||
          serverData.total_private_repos !== storedUserData.total_private_repos
        ) {
          /* User data is out of date in local storage and should 
          be updated in the local storage and in the page */
          localStorage.setItem("userData", JSON.stringify(serverData))
          this.userData = serverData
          toastNotification("User data updated!")
        } else {
          /* User data in local storage is up to date 
          and can be displayed in the page */
          this.userData = storedUserData
          toastNotification("The user data is up to date.")
        }
      } 
    } else {
      /* User data is not in local storage, proceeds to get 
      the data from the server and save it in the storage */
      this.userData = await getUserData(this)
      if(this.userData) {
        localStorage.setItem("userData", JSON.stringify(this.userData))
      }
    }
  }

  /* Class method: showUserData */
  async showUserData() {
    this.loading = true
    await this.manageUserData()
  }

  /* Class method: Handle the content load without make a server call and */
  loadUserDataFromLocalStorage() {
    const storedAccessToken = localStorage.getItem("accessToken")
    const storedUserData = localStorage.getItem("userData")
    const userData = JSON.parse(storedUserData)
    /* Checking if the accessToken and a valid storedUserData are in local
    storage for procced to show the user data when the page is reloaded. */
    if (storedAccessToken && userData && userData.login) {
      this.userData = userData
      this.welcomeSection = false
      this.btnSection = false
    } else if (storedAccessToken !== null) {
      /* Set the welcomeSection to true and btnSection to false only if the
      accessToken is saved in the local storage when page is reloaded */
      this.welcomeSection = true
      this.btnSection = false
    }
  }

  /* Class method: logout */
  logout() {
    this.btnLoading = true
    this.loading = !this.welcomeSection ? true : this.loading
    localStorage.removeItem("accessToken")
    localStorage.removeItem("userData")
    if (localStorage.getItem("accessToken") === null) {
      setTimeout(() => {
        this.btnLoading = false
        this.loading = false
        this.welcomeSection = true
        this.btnSection = true
      }, 2000)
    } else {
      toastNotification("Logout fail :(")
    }
  }

  /* Class method: openRepoModal */
  async openRepoModal() {
    const { RepoModal } = await import("./components/RepoModal.js")
    const repoModal = new RepoModal()
    repoModal.showModal()
  }

  /* Class method: openFilesModal */
  async openFilesModal() {
    const { FilesModal } = await import("./components/FilesModal.js")
    const filesModal = new FilesModal()
    filesModal.showModal()
  }

  /* Class method: render */
  render() {
    return html`
      <div class="container">
        <header class="header">
          <img src="${githubMark}" alt="Github mark">
          <img src="${githubLogo}" alt="Github logo">
        </header>
        <main class="main">
          ${this.loading ? html`
            <div class="loader">
              <sl-spinner></sl-spinner>
            </div>
          ` : this.welcomeSection ? html`
            <div class="welcome">
              <img src="${authentication}" alt="Welcome" />
            </div>
          ` : this.renderUserDataTemplate()}
        </main>
        <footer class="footer">
          ${this.btnLoading ? html`
              <sl-spinner></sl-spinner>
          ` : this.btnSection ? html`
            <sl-button @click=${this.login} variant="success" size="large">
              Login with Github
            </sl-button>
          ` : this.renderBtnTemplate()}
        </footer>
      </div>
    `
  }

  /* Class method: renderUserDataTemplate */
  renderUserDataTemplate() {
    return html`
      <div class="user-data">
        <img src=${this.userData.avatar_url} alt="User avatar">
        <h2>${this.userData.name}</h2>
        <p>@${this.userData.login}</p>
        <div class="repos-info">
          <small>Publics repos: <span>${this.userData.public_repos}</span></small>
          <small>Privates repos: <span>${this.userData.total_private_repos}</span></small>
        </div>
        <div class="repos-btn">
          <sl-button @click=${this.openRepoModal} variant="default" size="small">
            <sl-icon slot="prefix" name="folder-plus"></sl-icon>
            New repository
          </sl-button>
          <sl-button @click=${this.openFilesModal} variant="default" size="small">
            <sl-icon slot="prefix" name="cloud-arrow-up"></sl-icon>
            Upload files
          </sl-button>
        </div>
        <a href=${this.userData.html_url} target="_blank">Go to profile</a>
      </div>
    `
  }

  /* Class method: renderBtnTemplate */
  renderBtnTemplate() {
    return html`
      <sl-button id="btnGetUserData" @click=${this.showUserData} variant="primary" size="large">
        Get User Data
      </sl-button>
      <sl-button id="btnLogout" @click=${this.logout} variant="danger" size="large">
        Logout
      </sl-button>
    `
  }

  /* Class Lit method: styles */
  static get styles() {
    return css`
      :host * {
        margin: 0;
      }
      .container {
        display: flex;
        flex-direction: column;
        box-shadow: 0px 20px 20px 0px rgba(0, 0, 0, 0.5);
        border-radius: 15px;
        overflow: hidden;
        border-top: 1px solid rgba(255, 255, 255, 0.5);
        border-left: 1px solid rgba(255, 255, 255, 0.5);
        text-align: center;
      }
      .header > img {
        height: 5rem;
        padding: 1rem;
      }
      .welcome > img {
        width: 22rem;
      }
      .main > .loader {
        height: 26rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .main > .loader > sl-spinner {
        font-size: 5rem;
      }
      .footer {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        margin: 10px 5px;
      }
      .footer > sl-spinner {
        font-size: 2.5rem;
      }
      .user-data {
        display: flex;
        gap: 28px;
        flex-direction: column;
        align-items: center;
      }
      .user-data > img {
        height: 10rem;
        border-radius: 50%;
      }
      .user-data > h2 {
        font-size: 1rem;
      }     
      .user-data > p {
        font-size: 1.25rem;
        font-weight: 300;
        color: #656d76;
      }
      .repos-info {
        display: flex;
        gap: 5px;
        color: #656d76;
        font-weight: 600;
      }
      .repos-info > small > span {
        color: #c72121;
      }
      .repos-btn {
        display: flex;
        gap: 5px;
      }
      .repos-btn > sl-button::part(base) {
        border: 1px solid rgba(31,35,40,.5);
      }
      .repos-btn > sl-button::part(label) {
        font-weight: 700;
      }
      .user-data > a {
        text-decoration: none;
        color: #0969da;
      }
      .user-data > a:hover {
        text-decoration: underline;
      }
      @media (width <= 767px) {
        .repos-info,
        .repos-btn,
        .footer {
        flex-direction: column;
        }
      }
    `
  }
}

window.customElements.define("github-login", GithubLogin)