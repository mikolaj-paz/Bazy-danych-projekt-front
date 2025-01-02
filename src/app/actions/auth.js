'use server'

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "../lib/session";

export async function signup( formData ) {
    'use server'
    
    const login = formData.get('login')
    const password = formData.get('password')
    const isAdmin = formData.get('admin') === null ? false : true;

    console.log(login, password, isAdmin)

    await createSession('1', isAdmin ? 'admin' : 'worker', "test", "test", login)
    redirect('/dashboard')
}

export async function logout() {
    deleteSession()
    redirect('/')
}