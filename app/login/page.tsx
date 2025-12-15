"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
    rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true)
        setError(null)

        const result = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        })

        setIsLoading(false)

        if (result?.error) {
            setError("Invalid email or password")
        } else {
            router.push("/dashboard")
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column - Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                disabled={isLoading}
                                className={cn(errors.email && "border-red-500 focus:border-red-500")}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••••"
                                disabled={isLoading}
                                className={cn(errors.password && "border-red-500 focus:border-red-500")}
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="rememberMe" {...register("rememberMe")} />
                            <label
                                htmlFor="rememberMe"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                            >
                                Remember me
                            </label>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full text-base" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Column - Brand */}
            <div className="hidden lg:flex flex-col justify-center px-16 bg-[var(--primary-blue)] text-white relative overflow-hidden">
                {/* Decorative circle/gradient if needed, for now just clean blue as per image */}
                <div className="max-w-xl space-y-6 z-10">
                    <h2 className="text-5xl font-bold tracking-tight">ticktock</h2>
                    <p className="text-lg text-blue-100 leading-relaxed opacity-90">
                        Introducing ticktock, our cutting-edge timesheet web application designed
                        to revolutionize how you manage employee work hours. With ticktock, you
                        can effortlessly track and monitor employee attendance and productivity
                        from anywhere, anytime, using any internet-connected device.
                    </p>
                </div>
                <div className="absolute bottom-4 right-4 text-sm text-blue-200 opacity-60">
                    © 2024 Ticktock
                </div>
            </div>
        </div>
    )
}
