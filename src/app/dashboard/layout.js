import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react"
import { logout } from "../actions/auth"

import Image from "next/image"

export default function DashboardLayout({ children }) {
  return (
    <>
        <Navbar isBordered>
          <NavbarBrand justify="left">
            <Image 
              src="/mechanic-svgrepo-com.svg"
              width={800}
              height={800}
              alt="Logo"
              style={{
                width: "2rem",
              }}
              className="mr-2"
            />
            <p className="font-bold">WARSZTAT</p>
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem>
              <Link color="foreground" href="/dashboard/naprawy">
                Naprawy
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href="/dashboard/mechanicy">
                Mechanicy
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href="/dashboard/pojazdy">
                Pojazdy
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href="/dashboard/klienci">
                Klienci
              </Link>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem>
              <Button onPress={logout} color="primary" variant="flat">
                Wyloguj
              </Button>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
        {children}
    </>
  )
}
