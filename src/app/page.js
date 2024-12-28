'use client'

import { Button, Checkbox, Form, Input, Switch } from "@nextui-org/react";
import { signup } from "./actions/auth";

import Image from "next/image";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Image 
                src="/mechanic-svgrepo-com.svg"
                width={800}
                height={800}
                alt="Logo"
                style={{
                width: "6rem",
                }}
                className="m-6"
            />
            <Form action={signup}>
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
                <div className="flex gap-4">
                    <Checkbox type="checkbox" name="admin">
                        Administrator
                    </Checkbox>
                    <Button type="submit" variant="bordered">
                        Zaloguj
                    </Button>
                </div>
            </Form>
       </div>
    )
}