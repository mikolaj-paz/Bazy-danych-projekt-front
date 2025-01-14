'use server'

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "../lib/session";
import { verifySession } from "../lib/dal";
import { cache } from "react";

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

    switch (res.status) {
        case 200: // SUCCESS
            const json = await res.json()
            const isAdmin = json.roles == 'ROLE_ADMIN'
            await createSession('1', isAdmin ? 'admin' : 'worker', json.token, login)
            redirect('/dashboard')
        case 401: // AUTHENTICATION FAILED
            redirect('/?message=Niepoprawne-dane-logowania')
    }
}

export async function logout() {
    deleteSession()
    redirect('/')
}

export const getToken = cache(async () => {
    const session = await verifySession();
    return session.token;
})

export const getLogin = cache(async () => {
    const session = await verifySession();
    return session.login;
})