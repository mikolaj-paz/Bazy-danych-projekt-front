import { redirect } from "next/navigation"

export default function Dashboard() {
    redirect('/dashboard/klienci')

    return (
        <p>Dashboard</p>
    )
}