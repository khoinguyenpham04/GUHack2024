'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function GameNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-4xl font-semibold text-purple-600">
        Game was not found : (
      </h1>
      <Button asChild className="bg-gray-200 text-gray-900 hover:bg-gray-300">
        <Link href="/">Take me home!</Link>
      </Button>
    </div>
  )
}