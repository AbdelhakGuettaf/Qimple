import { Router } from "express"
import { FetchEmployees } from "./lib/utils"

const router = Router()

router.get("/updateEmployees", async (req, res) => {
  if (!req.query.agency) {
    res.status(400).send("Missing agency")
    return
  }
  const employees = await FetchEmployees(req.query.agency as string)

  return employees
})

export default Router().use("/api", router)
