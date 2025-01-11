'use client'

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Form, Input, Textarea } 
from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import Image from "next/image";
import { getToken } from "@/app/actions/auth";

export default function Naprawy() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [filterValue, setFilterValue] = React.useState("");

    const hasSearchFilter = Boolean(filterValue);

    let list = useAsyncList({
        async load({ signal }) {
            const res = await fetch('http://192.168.1.108:8080/naprawy', {
                signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                }
            });
            let json = await res.json();
            console.log(json);

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
                    repair.naprawaID + repair.stan + repair.data_rozpoczecia + repair.data_zakonczenia + repair.protokol_naprawy + repair.opis_usterki
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
        console.log(item);
        editModal.onOpen();
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        
        if (isNew) {
            let formattedObj = { klient: {}, pojazd: {}, mechanik: {
                "imie": "",
                "nazwisko": "",
            }};
            const clientAttr = [ "imie" , "nazwisko", "telefon", "email" ];
            const vehicleAttr = [ "rejestracja", "marka", "model", "rocznik", "vin" ];
            Object.entries(data).map(([key, value]) => {
                if (clientAttr.includes(key))
                    formattedObj.klient[key] = value;
                else if (vehicleAttr.includes(key))
                    formattedObj.pojazd[key] = value;
            });
    
            const res = await fetch('http://192.168.1.108:8080/dodaj/nowe/zgloszenie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                },
                body: JSON.stringify(formattedObj),
            });

            console.log(res);
        }
        else {
            const res = await fetch('http://192.168.1.108:8080/przyjecie/naprawy', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({
                    naprawaID: data.naprawaID,
                    "mechanik": { "login": data.login },
                })
            })

            console.log(res)
        }

        list.reload();
    }

    const renderCell = React.useCallback((repair, columnKey) => {
        const cellValue = repair[columnKey]

        if (cellValue == null)
            return "brak";

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
                        <TableColumn key="naprawaID" allowsSorting>
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
                            key={item.naprawaID}
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
                                        className="w-20"
                                        isReadOnly
                                        label="ID"
                                        name="naprawaID"
                                        defaultValue={obj["naprawaID"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
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
                                        isReadOnly
                                        label="Data Zakończenia"
                                        name="dataZakonczenia"
                                        defaultValue={obj["dataZakonczenia"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Textarea 
                                        isReadOnly
                                        className="w-full"
                                        label="Opis usterki"
                                        name="opis_usterki"
                                        defaultValue={obj["opis_usterki"]}
                                        labelPlacement="outside"
                                    />
                                    <Textarea 
                                        isReadOnly
                                        className="w-full"
                                        label="Protokół naprawy"
                                        name="protokol_naprawy"
                                        defaultValue={obj["protokol_naprawy"]}
                                        labelPlacement="outside"
                                    />
                                    <Input 
                                        isReadOnly={obj["mechanik"] ? true : false}
                                        label="Login mechanika"
                                        name="login"
                                        defaultValue={obj["mechanik"] ? obj["mechanik"].login : null}
                                        color={obj["mechanik"] ? "default" : "warning"}
                                        labelPlacement="outside-left"
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Zamknij
                                    </Button>
                                    <Button color="primary" type="submit" onPress={onClose}
                                        isDisabled={obj["mechanik"] ? true : false}
                                    >
                                        Przypisz mechanika
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