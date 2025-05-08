'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
    const router = useRouter()
    const { useSession } = authClient
    const { data: session, isPending } = useSession()

    useEffect(() => {
        // Middleware should handle redirects, but this is a backup
        if (!isPending) {
            if (session?.user) {
                router.replace('/dashboard')
            } else {
                router.replace('/login')
            }
        }
    }, [session, isPending, router])

    // Show loading indicator while middleware or client-side redirect happens
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-purple-100 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                <h2 className="mt-4 text-xl text-purple-800">Loading...</h2>
            </div>
        </div>
    )
}