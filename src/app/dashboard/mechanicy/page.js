'use client'

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Form, Input, Textarea, getKeyValue } 
from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import Image from "next/image";
import { getToken } from "@/app/actions/auth";

export default function Naprawy() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [filterValue, setFilterValue] = React.useState("");
    const [maxId, setMaxId] = React.useState(0);

    const hasSearchFilter = Boolean(filterValue);

    let list = useAsyncList({
        async load({ signal }) {
            const res = await fetch('http://192.168.1.108:8080/mechanicy', {
                signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                }
            });
            let json = await res.json();

            let maxValue = maxId;
            json.map((el) => {
                const valueFromObject = el.mechanikID;
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
        let filteredMechanics = [...list.items];

        if (hasSearchFilter) {
            filteredMechanics = filteredMechanics.filter((mechanic) => 
                (
                    mechanic.mechanikID + mechanic.czyZatrudniony + mechanic.imie + mechanic.login + mechanic.nazwisko
                ).toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredMechanics;
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
        setModalHeader("Dodawanie nowego pracownika");
        setNew(true);
        newModal.onOpen();
    }

    const editItem = (item) => {
        setModalHeader("Edytowanie profilu");

        setNew(false);

        setObj(item);
        editModal.onOpen();
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        if (isNew) {
            const res = await fetch('http://192.168.1.108:8080/dodaj/mechanika', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({
                    imie: data.imie,
                    nazwisko: data.nazwisko,
                    login: data.login,
                    haslo: data.haslo,
                })
            });

            console.log(res);
        }
        else {
            const res = await fetch('http://192.168.1.108:8080/zwolnij/mechanika', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({
                    login: data.login,
                })
            });

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
                    Dodaj nowego mechanika
                </Button>
            </div>
            <div className="p-4">
                <Table
                    removeWrapper
                    aria-label="Mechanics table"
                    sortDescriptor={list.sortDescriptor}
                    onSortChange={list.sort}
                    >
                    <TableHeader>
                        <TableColumn key="mechanikID" allowsSorting>
                            ID
                        </TableColumn>
                        <TableColumn key="imie" allowsSorting>
                            Imię
                        </TableColumn>
                        <TableColumn key="nazwisko" allowsSorting>
                            Nazwisko
                        </TableColumn>
                        <TableColumn key="czyZatrudniony" allowsSorting>
                            Zatrudnienie
                        </TableColumn>
                        <TableColumn key="login" allowsSorting>
                            Login
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
                            key={item.mechanikID}
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
                                <ModalBody className="w-full">
                                    <Input 
                                        className="w-20"
                                        isReadOnly
                                        label="ID"
                                        name="mechanikID"
                                        defaultValue={obj["mechanikID"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
                                        label="Imię"
                                        name="imie"
                                        defaultValue={obj["imie"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
                                        label="Nazwisko"
                                        name="nazwisko"
                                        defaultValue={obj["nazwisko"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        className="w-36"
                                        isReadOnly
                                        label="Zatrudnienie"
                                        name="zatrudnienie"
                                        defaultValue={obj["czyZatrudniony"]}
                                        color={obj["czyZatrudniony"] == "TAK" ? "success" : "danger"}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
                                        label="Login"
                                        name="login"
                                        defaultValue={obj["login"]}
                                        labelPlacement="outside-left"
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Anuluj
                                    </Button>
                                    <Button 
                                        color="danger" variant="bordered" type="submit" onPress={onClose}
                                        isDisabled={obj["czyZatrudniony"] == "NIE" }
                                    >
                                        Zwolnij
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
                                    label="Login"
                                    name="login"
                                    labelPlacement="outside-left"
                                />
                                <Input 
                                    label="Hasło"
                                    name="haslo"
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