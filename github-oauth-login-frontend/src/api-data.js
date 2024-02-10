/* Components imports */
import { ToastNotification } from "./components/ToastNotification.js"
/* Global variables */
const BACKEND_URL = process.env.BACKEND_URL

/* Fetch access token from the backend server, stores the access 
token in localStorage and handles different error cases. */
let accessToken
export async function getAccessToken(code, githubLoginInstance) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/getaccesstoken?code=${code}`,
      {
        method: "GET",
      }
    )
    if(response.ok) {
      const data = await response.json()
      if (data.access_token) {
        accessToken = data.access_token
        localStorage.setItem("accessToken", accessToken)
        githubLoginInstance.btnSection = false
        ToastNotification("Login successful!")
        return data
      }
      switch(data.error) {
        case "incorrect_client_credentials":
        ToastNotification("Login fail." + " " + data.error_description)
        break
        case "redirect_uri_mismatch":
        ToastNotification("Login fail." + " " + data.error_description)
        break
        case "bad_verification_code":
        ToastNotification("Login fail." + " " + data.error_description)
        break
        case "unverified_user_email":
        ToastNotification("Login fail." + " " + data.error_description)
        break
      }
    } else {
      ToastNotification("Login fail, error trying to get access token.")
      throw new Error("Login fail, error trying to get access token.")
    }
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

/* Fetch user data from the backend server, check if the user data 
is valid and handles different error cases. */
let userData
export async function getUserData(githubLoginInstance) {
  try {
    const response = await fetch(`${BACKEND_URL}/getuserdata`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    })
    if(response.ok) {
      const data = await response.json()
      if(data.login) {
        userData = data
        githubLoginInstance.loading = false
        githubLoginInstance.welcomeSection = false
        return data
      } else if ((data.message == "Bad credentials") || (data.message == "Requires authentication")) {
        githubLoginInstance.invalidAccessToken()
      }
    } 
  } catch (error) {
    githubLoginInstance.loading = false
    ToastNotification("Connection error, fail to get the user data from the server.")
    console.error("Connection error, fail to get the user data from the server.", error)
    throw error
  }
}