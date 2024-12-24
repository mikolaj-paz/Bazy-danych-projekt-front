import 'server only'

import { cookies } from 'next/headers'
import { decrypt } from './session'
import { redirect } from 'next/navigation'

export const verifySession = cache(async() => {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    if (!session.userId) {
        redirect('/')
    }

    return { isAuth: true, userID: session.userID }
})