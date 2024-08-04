import { rhApi } from "./config"
import { RhEmployee } from "./types"

export const FetchEmployees = async (agency: String) => {
  if (!agency) return null

  const res = await rhApi.get(`/agencyEmployees?agency=${agency}`)

  if (res.status !== 200) {
    throw new Error("Failed to fetch employees")
  }

  return res.data as RhEmployee[]
}
