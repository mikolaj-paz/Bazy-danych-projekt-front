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

    const hasSearchFilter = Boolean(filterValue);

    let list = useAsyncList({
        async load({ signal }) {
            const res = await fetch('http://192.168.1.108:8080/pojazdy', {
                signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`
                }
            });
            console.log(res.ok);
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
        let filteredVehicles = [...list.items];

        if (hasSearchFilter) {
            filteredVehicles = filteredVehicles.filter((vehicle) => 
                (
                    vehicle.vin + vehicle.marka + vehicle.model + vehicle.rocznik + vehicle.rejestracja + vehicle.klientid
                ).toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredVehicles;
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
        setModalHeader("Dodanie nowego pojazdu");
        setNew(true);
        newModal.onOpen();
    }

    const editItem = (item) => {
        setModalHeader("Edytowanie pojazdu");

        setNew(false);

        setObj(item);
        editModal.onOpen();
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        if (isNew) {
            let formattedObj = { pojazd: {} };
            const vehicleAttr = [ "rejestracja", "marka", "model", "rocznik", "vin" ];
            Object.entries(data).map(([key, value]) => {
                if (vehicleAttr.includes(key))
                    formattedObj.pojazd[key] = value;
                else if (key === "telefon")
                    formattedObj["telefonKlienta"] = value;
            });

            const res = await fetch('http://192.168.1.108:8080/dodaj/pojazdy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`
                },
                body: JSON.stringify(formattedObj),
            });

            console.log(res);
        }
        else {
            const res = await fetch('http://192.168.1.108:8080/modyfikuj/dane/pojazdow', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`
                },
                body: JSON.stringify({
                    rejestracja: data.rejestracja,
                    marka: data.marka,
                    model: data.model,
                    rocznik: data.rocznik,
                    vin: data.vin,
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
                    Dodaj nowy pojazd
                </Button>
            </div>
            <div className="p-4">
                <Table
                    removeWrapper
                    aria-label="Vehicles table"
                    sortDescriptor={list.sortDescriptor}
                    onSortChange={list.sort}
                    >
                    <TableHeader>
                        <TableColumn key="vin" allowsSorting>
                            VIN
                        </TableColumn>
                        <TableColumn key="rejestracja" allowsSorting>
                            Rejestracja
                        </TableColumn>
                        <TableColumn key="marka" allowsSorting>
                            Marka
                        </TableColumn>
                        <TableColumn key="model" allowsSorting>
                            Model
                        </TableColumn>
                        <TableColumn key="rocznik" allowsSorting>
                            Rocznik
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
                            key={item.vin}
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
                <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} scrollBehavior="outside" size="xl">
                    <ModalContent>
                        {(onClose) => (
                            <Form onSubmit={onSubmit} autoComplete="off">
                                <ModalHeader className="flex flex-col gap-1">{modalHeader}</ModalHeader>
                                <ModalBody className="w-full">
                                    <Input 
                                        className="w-24"
                                        isReadOnly
                                        label="VIN"
                                        name="vin"
                                        defaultValue={obj["vin"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
                                        label="Marka"
                                        name="marka"
                                        defaultValue={obj["marka"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
                                        label="Model"
                                        name="model"
                                        defaultValue={obj["model"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
                                        label="Rocznik"
                                        name="rocznik"
                                        defaultValue={obj["rocznik"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Input
                                        isReadOnly
                                        label="Rejestracja"
                                        name="rejestracja"
                                        defaultValue={obj["rejestracja"]}
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
                                    label="Rejestracja"
                                    name="rejestracja"
                                    labelPlacement="outside-left"
                                />
                                <Input
                                    label="VIN"
                                    name="vin"
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
                                    label="Telefon właściciela"
                                    name="telefon"
                                    type="tel"
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