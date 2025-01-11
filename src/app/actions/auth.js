'use server'

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "../lib/session";
import { verifySession } from "../lib/dal";

export async function signup( formData ) {
    'use server'
    
    const login = formData.get('login')
    const password = formData.get('password')

    const res = await fetch('http://192.168.1.108:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            login: login,
            haslo: password,
        })
    })

    const json = await res.json()

    const isAdmin = json.roles == 'ROLE_ADMIN'

    await createSession('1', isAdmin ? 'admin' : 'worker', json.token)
    redirect('/dashboard')
}

export async function logout() {
    deleteSession()
    redirect('/')
}

export async function getToken() {
    const session = await verifySession();

    return session.token;
}