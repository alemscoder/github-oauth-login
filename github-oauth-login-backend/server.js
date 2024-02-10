/* Libs imports */
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
/* Loads .env file */
dotenv.config()
/* Global variables */
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const PORT = process.env.PORT || 4000
/* Initialize express */
const app = express()
/* CORS middleware for allow requests from others domains */
app.use(cors())

/* Route to fetch OAuth access token from GitHub, expects 
'code' parameter in GET query and uses it with client 
credentials to get token. */
app.get("/getaccesstoken", async (req, res) => {
  const params =
    "?client_id=" +
    CLIENT_ID +
    "&client_secret=" +
    CLIENT_SECRET +
    "&code=" +
    req.query.code +
    "&redirect_uri=" +
    REDIRECT_URI
  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token" + params,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      },
    )
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error(error)
  }
})

/* Route to fetch user data from GitHub, expects access token 
in 'Authorization' header and uses it to get user data. */
app.get("/getuserdata", async (req, res) => {
  const accessToken = req.get("Authorization")
  try {
    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: accessToken,
      },
    })
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error(error)
  }
})

/* Server port configuration */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})