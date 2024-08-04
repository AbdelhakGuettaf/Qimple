import axios from "axios"

require("dotenv").config()

export const port = 3000

export const rhApi = axios.create({
  baseURL: "https://kazitour-rh.com/api",
  params: { api_key: process.env.API_SECRET },
})
