// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session && req.nextUrl.pathname.startsWith('/photos/patient-step')) {
        return NextResponse.redirect(new URL('/authentication/login', req.url))
    }

    if (!session && req.nextUrl.pathname.startsWith('/sessions')) {
        return NextResponse.redirect(new URL('/authentication/login', req.url))
    }

    return res
}

export const config = {
    matcher: ['/photos/patient-step', '/sessions/:path*']
}