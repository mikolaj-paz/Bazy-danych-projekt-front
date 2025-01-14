import { Button, Chip, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react"
import { getLogin, logout } from "../actions/auth"

import Image from "next/image"

export default async function DashboardLayout({ children }) {
  const login = await getLogin();

  return (
    <>
        <Navbar isBordered maxWidth="full">
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
            <p className="font-bold text-inherit">WARSZTAT</p>
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
              <Chip variant="flat">
                {login}
              </Chip>
            </NavbarItem>
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
