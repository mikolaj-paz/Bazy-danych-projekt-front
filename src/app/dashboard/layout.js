import { Menu } from "@/components/menu"

export default function DashboardLayout({ children }) {
  return (
    <div>
        <div><Menu /></div>
        <div>{children}</div>
    </div>
  )
}
