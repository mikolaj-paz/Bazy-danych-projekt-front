'use client'

import { Button, Form, Input } from "@nextui-org/react";
import { signup } from "./actions/auth";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function Home() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') ? searchParams.get('message').replace(/-/gi, " ") : "";

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Image 
                priority
                src="/mechanic-svgrepo-com.svg"
                width={800}
                height={800}
                alt="Logo"
                style={{
                width: "6rem",
                }}
                className="m-6"
            />
            <Form className="w-64" action={signup}>
                <Input 
                    isRequired
                    name="login"
                    label="Login"
                    type="login"
                />
                <Input 
                    isRequired
                    name="password"
                    label="Hasło"
                    type="password"
                />
                <div className="flex justify-center w-full">
                    <Button className="w-3/4 rounded-full mt-4" type="submit" variant="solid" color="primary">
                        Zaloguj
                    </Button>
                </div>
            </Form>
            <p className="flex justify-center text-sm text-danger w-full">{message}</p>
       </div>
    )
}