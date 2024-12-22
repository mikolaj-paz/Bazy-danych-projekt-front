'use client'

import { signup } from "./actions/auth";

export default function Home() {
    return (
        <div className="flex items-center justify-center h-screen">
            <form action={signup}>
                <div className="p-1">
                    <input type="text" name="login" placeholder="Login" required
                        className="border p-2 mr-2"
                    />
                </div>
                <div className="p-1">
                    <input type="password" name="password" placeholder="Hasło" required
                        className="border p-2 mr-2"
                    />
                </div>
                <div className="flex justify-center p-1">
                    <button type="submit" className="border p-2 mr-2">Zaloguj</button>
                </div>
            </form>
        </div>
    )
}