'use client'

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Form, Input } 
from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import Image from "next/image";
import { getToken } from "@/app/actions/auth";

export default function Klienci() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [filterValue, setFilterValue] = React.useState("");
    const [maxId, setMaxId] = React.useState(0);

    const hasSearchFilter = Boolean(filterValue);

    let list = useAsyncList({
            async load({ signal }) {
                console.log("is here");
                const res = await fetch('http://192.168.1.108:8080/klienci', {
                    signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await getToken()}`,
                    }
                });
                let json = await res.json();
    
                let maxValue = maxId;
                json.map((el) => {
                    const valueFromObject = el.klientID;
                    maxValue = Math.max(maxValue, valueFromObject);
                });
                setMaxId(maxValue + 1);
    
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
                    user.klientID + user.imie + user.nazwisko + user.telefon + user.email
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
        list.reload;
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        list.reload;
    }, []);

    const editModal = useDisclosure();
    const newModal = useDisclosure();
    const [obj, setObj] = useState(null);
    const [isNew, setNew] = useState(false);
    const [modalHeader, setModalHeader] = useState("");

    const addItem = () => {
        setModalHeader("Nowy wpis");
        setNew(true);
        newModal.onOpen();
    }
    
    const editItem = (item) => {
        setModalHeader("Edytowanie wpisu");
        setNew(false);
        setObj(item);
        editModal.onOpen();
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        
        if (isNew) {
            const res = await fetch('http://192.168.1.108:8080/dodaj/klienta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({
                    imie: data.imie,
                    nazwisko: data.nazwisko,
                    telefon: data.telefon,
                    email: data.email,
                })
            })

            console.log(res);
        }
        else {
            const res = await fetch('http://192.168.1.108:8080/modyfikuj/dane/klienta', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({
                    imie: data.imie,
                    nazwisko: data.nazwisko,
                    telefon: data.telefon,
                    email: data.email,
                })
            })

            console.log(res);
        }

        list.reload();
    }

    return (
        <>
            <div className="flex justify-between items-end mx-4">
                <Input 
                    isDisabled={isLoading}
                    isClearable
                    className="w-full sm:max-w-[33%]"
                    type="search"
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
                <Button isDisabled={isLoading} variant="flat" color="success" onPress={() => addItem()}>
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
                        <TableColumn key="klientID" allowsSorting>
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
                        {/* <TableColumn>
                            Pojazd
                        </TableColumn> */}
                    </TableHeader>
                    <TableBody 
                        emptyContent={"Brak wpisów do wyświetlenia."}
                        isLoading={isLoading}
                        items={items}
                        loadingContent={<Spinner label="Ładowanie..." />}
                    >
                        {(item) => (
                            <TableRow 
                                key={item.klientID}
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
                <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} scrollBehavior="outside" size="sm">
                    <ModalContent>
                        {(onClose) => (
                                <Form onSubmit={onSubmit} autoComplete="off">
                                    <ModalHeader className="flex flex-col gap-1">{modalHeader}</ModalHeader>
                                    <ModalBody>
                                        <Input 
                                            className="w-20"
                                            isReadOnly
                                            label="ID"
                                            name="klientID"
                                            defaultValue={obj["klientID"]}
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
                                            Anuluj
                                        </Button>
                                        <Button color="primary" type="submit" onPress={onClose}>
                                            Zapisz zmiany
                                        </Button>
                                    </ModalFooter>
                                    </Form>
                        )}
                    </ModalContent>
                </Modal>
            )}

            <Modal isOpen={newModal.isOpen} onOpenChange={newModal.onOpenChange} scrollBehavior="outside">
                <ModalContent>
                    {(onClose) => (
                        <Form onSubmit={onSubmit} autoComplete="off">
                            <ModalHeader className="flex flex-col gap-1">{modalHeader}</ModalHeader>
                            <ModalBody className="w-full">
                                <Input
                                    label="Imię"
                                    name="imie"
                                    labelPlacement="outside-left"
                                />
                                <Input
                                    label="Nazwisko"
                                    name="nazwisko"
                                    labelPlacement="outside-left"
                                />
                                <Input
                                    label="Telefon"
                                    name="telefon"
                                    type="tel"
                                    labelPlacement="outside-left"
                                />
                                <Input
                                    label="E-mail"
                                    name="email"
                                    type="email"
                                    labelPlacement="outside-left"
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Anuluj
                                </Button>
                                <Button color="primary" type="submit" onPress={onClose}>
                                    Zatwierdź
                                </Button>
                            </ModalFooter>
                        </Form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}