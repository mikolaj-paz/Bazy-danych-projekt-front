import 'server-only'

import { cookies } from 'next/headers'
import { decrypt } from './session'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const verifySession = cache(async() => {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    return { isAuth: true, token: session.token, role: session.role, login: session.login}
})