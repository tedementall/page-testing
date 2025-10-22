import { useEffect, useState } from "react"

export function useAdminFlag() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const readFlag = () => {
      try {
        setIsAdmin(window.sessionStorage.getItem("isAdminLoggedIn") === "true")
      } catch (error) {
        console.warn("Unable to read admin flag", error)
        setIsAdmin(false)
      }
    }

    readFlag()

    const handleStorage = (event) => {
      if (event.key === "isAdminLoggedIn") {
        readFlag()
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return isAdmin
}
