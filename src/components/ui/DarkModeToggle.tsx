import { useEffect, useState } from "react"

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark") {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDark = () => {
    const newMode = !isDark
    setIsDark(newMode)
    document.documentElement.classList.toggle("dark", newMode)
    localStorage.setItem("theme", newMode ? "dark" : "light")
  }

  return (
    <label className="inline-flex items-center cursor-pointer">
      <span className="mr-2 text-sm">{isDark ? "🌙" : "☀️"}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={isDark}
          onChange={toggleDark}
        />
        <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner transition-colors duration-300"></div>
        <div
          className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${
            isDark ? "translate-x-4" : ""
          }`}
        ></div>
      </div>
    </label>
  )
}
