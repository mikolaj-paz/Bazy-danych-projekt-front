'use client'

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Form, Input, Textarea } 
from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import Image from "next/image";

export default function Naprawy() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [filterValue, setFilterValue] = React.useState("");

    const hasSearchFilter = Boolean(filterValue);

    let list = useAsyncList({
        async load({ signal }) {
            const res = await fetch('https://67696ae7cbf3d7cefd3ac0d1.mockapi.io/mechanics',
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
        let filteredRepairs = [...list.items];

        if (hasSearchFilter) {
            filteredRepairs = filteredRepairs.filter((repair) => 
                (
                    repair.naprawaid + repair.stan + repair.data_rozpoczecia + repair.data_zakonczenia + repair.protokol_naprawy + repair.opis_usterki
                ).toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredRepairs;
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

    const editModal = useDisclosure();
    const newModal = useDisclosure();
    const [obj, setObj] = useState(null);
    const [isNew, setNew] = useState(false);
    const [modalHeader, setModalHeader] = useState("");

    const addItem = () => {
        setModalHeader("Nowe zgłoszenie");
        setNew(true);
        newModal.onOpen();
    }

    const editItem = (item) => {
        setModalHeader("Edytowanie wpisu");
        setNew(false);
        setObj(item);
        editModal.onOpen();
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        let [method, path] = isNew ? 
                             ["POST", "dodaj/nowe_zgloszenie"] : 
                             ["PATCH", ""];
        console.log(data);
    }

    const renderCell = React.useCallback((repair, columnKey) => {
        const cellValue = repair[columnKey]

        switch (columnKey) {
            case "opis_usterki":
                return (
                    <div className="overflow-hidden max-h-10">
                        {cellValue}
                    </div>
                )
            case "protokol_naprawy":
                return (
                    <div className="overflow-hidden max-h-10">
                        {cellValue}
                    </div>
                )
            default:
                return cellValue;
        }
    }, []);

    return (
        <>
            <div className="flex justify-between items-end mx-4">
                <Input 
                    isClearable
                    className="w-full sm:max-w-[33%]"
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
                <Button variant="flat" color="success" onPress={() => addItem()}>
                    Nowe zgłoszenie
                </Button>
            </div>
            <div className="p-4">
                <Table
                    removeWrapper
                    aria-label="Repairs table"
                    sortDescriptor={list.sortDescriptor}
                    onSortChange={list.sort}
                    >
                    <TableHeader>
                        <TableColumn key="naprawaid" allowsSorting>
                            ID
                        </TableColumn>
                        <TableColumn key="stan" allowsSorting>
                            Stan
                        </TableColumn>
                        <TableColumn key="dataRozpoczecia" allowsSorting>
                            Data Rozpoczecia
                        </TableColumn>
                        <TableColumn key="dataZakonczenia" allowsSorting>
                            Data Zakończenia
                        </TableColumn>
                        <TableColumn key="opis_usterki" allowsSorting>
                            Opis usterki
                        </TableColumn>
                        <TableColumn key="protokol_naprawy" allowsSorting>
                            Protokol
                        </TableColumn>
                        {/* <TableColumn key="vin">
                            VIN
                            </TableColumn>
                            <TableColumn key="mechanikid">
                            ID mechanika
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
                            key={item.naprawaid}
                            as={Button}
                            onClick={() => editItem(item)}
                            className="hover:bg-gray-100 cursor-pointer"
                            >
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            { obj && (
                <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} scrollBehavior="outside" size="5xl">
                    <ModalContent>
                        {(onClose) => (
                            <Form onSubmit={onSubmit} autoComplete="off">
                                <ModalHeader className="flex flex-col gap-1">{modalHeader}</ModalHeader>
                                <ModalBody className="w-full">
                                    <Input 
                                        className="w-24"
                                        isReadOnly
                                        label="ID"
                                        name="naprawaid"
                                        defaultValue={obj["naprawaid"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        label="Stan"
                                        name="stan"
                                        defaultValue={obj["stan"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
                                        label="Data Rozpoczęcia"
                                        name="dataRozpoczecia"
                                        defaultValue={obj["dataRozpoczecia"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        label="Data Zakończenia"
                                        name="dataZakonczenia"
                                        defaultValue={obj["dataZakonczenia"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Textarea 
                                        className="w-full"
                                        label="Opis usterki"
                                        name="opis_usterki"
                                        defaultValue={obj["opis_usterki"]}
                                        labelPlacement="outside"
                                    />
                                    <Textarea 
                                        className="w-full"
                                        label="Protokół naprawy"
                                        name="protokol_naprawy"
                                        defaultValue={obj["protokol_naprawy"]}
                                        labelPlacement="outside"
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
            
            <Modal isOpen={newModal.isOpen} onOpenChange={newModal.onOpenChange} scrollBehavior="outside">
                <ModalContent>
                    {(onClose) => (
                        <Form onSubmit={onSubmit} autoComplete="off">
                            <ModalHeader className="flex flex-col gap-1">{modalHeader}</ModalHeader>
                            <ModalBody className="w-full">
                                <h1>Klient</h1>
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
                                    label="Email"
                                    name="email"
                                    type="email"
                                    labelPlacement="outside-left"
                                />
                                <h1>Pojazd</h1>
                                <Input 
                                    label="Rejestracja"
                                    name="rejestracja"
                                    labelPlacement="outside-left"
                                />
                                <Input 
                                    label="Marka"
                                    name="marka"
                                    labelPlacement="outside-left"
                                />
                                <Input 
                                    label="Model"
                                    name="model"
                                    labelPlacement="outside-left"
                                />
                                <Input 
                                    label="Rocznik"
                                    name="rocznik"
                                    labelPlacement="outside-left"
                                />
                                <Input 
                                    label="VIN"
                                    name="vin"
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
        </>
    )
}