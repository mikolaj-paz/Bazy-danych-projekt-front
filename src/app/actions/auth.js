'use server'

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "../lib/session";

export async function signup( formData ) {
    'use server'
    
    const login = formData.get('login')
    const password = formData.get('password')

    console.log(login, password)

    await createSession('1')
    redirect('/dashboard')
}

export async function logout() {
    deleteSession()
    redirect('/')
}