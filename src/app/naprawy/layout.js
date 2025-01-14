import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, Chip } from "@nextui-org/react"
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
              <p className="font-bold">PANEL GŁÓWNY</p>
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
