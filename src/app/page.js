'use client'

import { Button, Checkbox, Form, Input, Switch } from "@nextui-org/react";
import { signup } from "./actions/auth";

import Image from "next/image";

export default function Home() {
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
                <div className="flex justify-center gap-4 w-full">
                    {/* <Checkbox type="checkbox" name="admin">
                        Administrator
                    </Checkbox> */}
                    <Button className="w-3/4 rounded-full mt-4" type="submit" variant="solid" color="primary">
                        Zaloguj
                    </Button>
                </div>
            </Form>
       </div>
    )
}