import { render, screen } from "@testing-library/react"
import { Badge } from "./badge"
import { describe, it, expect } from "vitest"

describe("Badge", () => {
    it("renders with default variant", () => {
        render(<Badge>Default</Badge>)
        const badge = screen.getByText("Default")
        expect(badge).toBeTruthy()
        expect(badge.className).toContain("bg-primary")
    })

    it("renders with completed status variant", () => {
        render(<Badge variant="completed">Completed</Badge>)
        const badge = screen.getByText("Completed")
        expect(badge.className).toContain("bg-emerald-100")
    })

    it("renders with missing status variant", () => {
        render(<Badge variant="missing">Missing</Badge>)
        const badge = screen.getByText("Missing")
        expect(badge.className).toContain("bg-pink-100")
    })
})
