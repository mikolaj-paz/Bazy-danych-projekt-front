'use client'

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Form, Input } 
from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import Image from "next/image";

export default function Klienci() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [filterValue, setFilterValue] = React.useState("");

    const hasSearchFilter = Boolean(filterValue);

    let list = useAsyncList({
        async load({ signal }) {
            const res = await fetch('https://67696ae7cbf3d7cefd3ac0d1.mockapi.io/clients',
                { signal }
            );
            let json = await res.json();

            setIsLoading(false);

            return {
                items: json,
            };
        },
        async sort({items, sortDescriptor}) {
            return {
                items: items.sort((a, b) => {
                    let first = a[sortDescriptor.column];
                    let second = b[sortDescriptor.column];
                    let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

                    if (sortDescriptor.direction === "ascending") {
                        cmp *= -1;
                    }

                    return cmp;
                }),
            };
        },
    });

    const items = React.useMemo(() => {
        let filteredUsers = [...list.items];

        if (hasSearchFilter) {
            filteredUsers = filteredUsers.filter((user) => 
                (
                    user.imie + user.nazwisko + user.telefon + user.email + user.klientid
                ).toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredUsers;
    }, [list.items, filterValue]);

    const onSearchChange = React.useCallback((value) => {
        if (value) {
            setFilterValue(value);
        } 
        else {
            setFilterValue("");
        }
        list.load;
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        list.load;
    }, []);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [obj, setObj] = useState(null);
    const [editedData, setEditedData] = useState(null);

    const editItem = (item) => {
        setObj(item);
        onOpen();
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        setEditedData(data);
        console.log(data);
    }

    return (
        <>
            <div className="flex justify-between items-end mx-4">
                <Input 
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Wyszukaj..."
                    startContent={<Image 
                        src="/search-svgrepo-com.svg"
                        width={800}
                        height={800}
                        alt="Search icon"
                        style={{
                            width: "1rem",
                        }}
                    />}
                    value={filterValue}
                    onClear={() => onClear()}
                    onValueChange={onSearchChange}
                />
                <Button variant="flat" color="success">
                    Dodaj wpis
                </Button>
            </div>
            <div className="p-4">
                <Table
                    removeWrapper
                    aria-label="Clients table"
                    sortDescriptor={list.sortDescriptor}
                    onSortChange={list.sort}
                >
                    <TableHeader>
                        <TableColumn key="klientid" allowsSorting>
                            ID
                        </TableColumn>
                        <TableColumn key="imie" allowsSorting>
                            Imię
                        </TableColumn>
                        <TableColumn key="nazwisko" allowsSorting>
                            Nazwisko
                        </TableColumn>
                        <TableColumn key="telefon" allowsSorting>
                            Telefon
                        </TableColumn>
                        <TableColumn key="email" allowsSorting>
                            E-mail
                        </TableColumn>
                    </TableHeader>
                    <TableBody 
                        emptyContent={"Brak wpisów do wyświetlenia."}
                        isLoading={isLoading}
                        items={items}
                        loadingContent={<Spinner label="Ładowanie..." />}
                    >
                        {(item) => (
                            <TableRow 
                                key={item.klientid}
                                as={Button}
                                onClick={() => editItem(item)}
                                className="hover:bg-gray-100 cursor-pointer"
                            >
                                {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            { obj && (
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
                    <ModalContent>
                        {(onClose) => (
                                <Form onSubmit={onSubmit} autoComplete="off">
                                    <ModalHeader className="flex flex-col gap-1">Klient</ModalHeader>
                                    <ModalBody>
                                        <Input 
                                            className="w-24"
                                            isReadOnly
                                            label="ID"
                                            name="klientid"
                                            defaultValue={obj["klientid"]}
                                            labelPlacement="outside-left"
                                        />
                                        <Input
                                            label="Imie"
                                            name="imie"
                                            defaultValue={obj["imie"]}
                                            labelPlacement="outside-left"
                                        />
                                        <Input
                                            label="Nazwisko"
                                            name="nazwisko"
                                            defaultValue={obj["nazwisko"]}
                                            labelPlacement="outside-left"
                                        />
                                        <Input
                                            label="Telefon"
                                            name="telefon"
                                            type="tel"
                                            defaultValue={obj["telefon"]}
                                            labelPlacement="outside-left"
                                        />
                                        <Input
                                            label="E-mail"
                                            name="email"
                                            type="email"
                                            defaultValue={obj["email"]}
                                            labelPlacement="outside-left"
                                        />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Zamknij
                                        </Button>
                                        <Button color="primary" type="submit" onPress={onClose}>
                                            Zapisz
                                        </Button>
                                    </ModalFooter>
                                    </Form>
                        )}
                    </ModalContent>
                </Modal>
            )}
        </>
    )
}