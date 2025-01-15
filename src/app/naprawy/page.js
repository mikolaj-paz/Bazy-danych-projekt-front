'use client'

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Form, Input, Textarea, Select, SelectItem, Chip, Popover, PopoverTrigger, PopoverContent, DatePicker } 
from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import Image from "next/image";
import { getLogin, getToken } from "@/app/actions/auth";
import { CalendarDate } from "@internationalized/date";

export default function Naprawy() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [filterValue, setFilterValue] = React.useState("");
    const [maxId, setMaxId] = React.useState(0);

    const hasSearchFilter = Boolean(filterValue);

    const statusColorMap = {
        "Oczekiwanie": "danger",
        "W trakcie": "warning",
        "Zakonczona": "success"
    }

    let list = useAsyncList({
        async load({ signal }) {
            const res = await fetch('http://192.168.1.108:8080/naprawy', {
                signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                },   
            });
            let json = await res.json();
            
            const mechanicLogin = await getLogin();
            json = json.filter((repair) => repair.mechanik ? repair.mechanik.login == mechanicLogin : false);

            let maxValue = maxId;
            json.map((el) => {
                const valueFromObject = el.naprawaID;
                maxValue = Math.max(maxValue, valueFromObject);
                
                if (el.data_rozpoczecia)
                    el.data_rozpoczecia = new Date(el.data_rozpoczecia).toLocaleDateString();
                if (el.data_zakonczenia)
                    el.data_zakonczenia = new Date(el.data_zakonczenia).toLocaleDateString();
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
        let filteredRepairs = [...list.items];
        
        if (hasSearchFilter) {
            filteredRepairs = filteredRepairs.filter((repair) => (
                    repair.naprawaID + repair.stan + repair.data_rozpoczecia + repair.data_zakonczenia + repair.protokol_naprawy + repair.opis_usterki
                    + (repair.pojazd ? (repair.pojazd.marka + repair.pojazd.model) : "")
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
    const [defaultSelect, setDefaultSelect] = useState(new Set([""]))

    const [startingDateChanged, setStartingDateChanged] = useState(false);
    const [endDateChanged, setEndDateChanged] = useState(false);
    const [descriptionChanged, setDescriptionChanged] = useState(false);

    const addItem = () => {
        setModalHeader("Przyjecie zgloszenia");
        setNew(true);
        newModal.onOpen();
    }

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const editItem = (item) => {
        setModalHeader("Edytowanie wpisu");

        setNew(false);
        setStartingDateChanged(false);
        setEndDateChanged(false);
        setDescriptionChanged(false);
        setStartDate(getCalendarFromLocal(item.data_rozpoczecia));
        setEndDate(getCalendarFromLocal(item.data_zakonczenia));

        setDefaultSelect(new Set([item.stan]))

        setObj(item);
        editModal.onOpen();
    };

    const onStartingDateChange = React.useCallback((value) => {
        setStartingDateChanged(true);
        setStartDate(value.toString());
    }, []);

    const onEndDateChange = React.useCallback((value) => {
        setEndDateChanged(true);
        setEndDate(value.toString());
    }, []);

    const onDescriptionChange = React.useCallback((value) => {
        setDescriptionChanged(true);
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        if (isNew) {
            const res = await fetch('http://192.168.1.108:8080/przyjecie/naprawy', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({
                    naprawaID: data.naprawaID,
                    mechanikLogin: `${await getLogin()}`,
                }),
            });
        }
        else {
            if (startingDateChanged) {
                const res = await fetch('http://192.168.1.108:8080/modyfikuj/rozpoczecie_naprawy', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify({
                        naprawaID: data.naprawaID,
                        data_rozpoczecia: startDate,
                    })
                });
                console.log("Starting date changed")
                console.log(res);
            }
            if (endDateChanged) {
                const res = await fetch('http://192.168.1.108:8080/modyfikuj/zakonczenie_naprawy', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify({
                        naprawaID: data.naprawaID,
                        data_zakonczenia: endDate,
                    })
                });
    
                console.log(res);
            }
            if (descriptionChanged) {
                const res = await fetch('http://192.168.1.108:8080/modyfikuj/opis_usterki', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify({
                        naprawaID: data.naprawaID,
                        opis_usterki: data.opis_usterki,
                        stan: data.stan,
                        protokol_naprawy: data.protokol_naprawy,
                    })
                });
    
                console.log(res);
            }
        }

        list.reload();
    }

    const getCalendarFromLocal = React.useCallback((date) => {
        if (!date) return null;
        const [day, month, year] = date.split(".");
        return new CalendarDate(parseInt(year), parseInt(month), parseInt(day))
    }, []);

    const renderCell = React.useCallback((repair, columnKey) => {
        const cellValue = repair[columnKey]

        if (!cellValue) return (
            <p className="text-black text-opacity-25">brak</p>
        );

        const vehicle = cellValue.marka + " " + cellValue.model        

        switch (columnKey) {
            case "stan":
                return (
                    <Chip color={statusColorMap[cellValue]} variant="flat">
                        {cellValue}
                    </Chip>
                )
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
            case "pojazd":
                return (
                    vehicle
                )
            default:
                return cellValue;
        }
    }, []);

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
                    Przyjmij zgłoszenie
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
                        <TableColumn key="data_rozpoczecia" allowsSorting>
                            Data Rozpoczecia
                        </TableColumn>
                        <TableColumn key="data_zakonczenia" allowsSorting>
                            Data Zakończenia
                        </TableColumn>
                        <TableColumn key="opis_usterki" allowsSorting>
                            Opis usterki
                        </TableColumn>
                        <TableColumn key="protokol_naprawy" allowsSorting>
                            Protokol
                        </TableColumn>
                        <TableColumn key="pojazd">
                            Pojazd 
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
                <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} scrollBehavior="outside" size="xl">
                    <ModalContent>
                        {(onClose) => (
                            <Form onSubmit={onSubmit} autoComplete="off">
                                <ModalHeader className="flex flex-col gap-1">{modalHeader}</ModalHeader>
                                <ModalBody className="w-full">
                                    <Input 
                                        className="w-24"
                                        isReadOnly
                                        label="ID"
                                        name="naprawaID"
                                        defaultValue={obj["naprawaID"]}
                                        labelPlacement="outside-left"
                                    />
                                    <Select
                                        className="w-48"
                                        label="Stan"
                                        name="stan"
                                        onChange={onDescriptionChange}
                                        labelPlacement="outside-left"
                                        placeholder="brak"
                                        defaultSelectedKeys={defaultSelect}
                                    >
                                        <SelectItem key="Oczekiwanie" value="oczekiwanie" color="danger">
                                            Oczekiwanie
                                        </SelectItem>
                                        <SelectItem key="W trakcie" value="W trakcie" color="warning">
                                            W trakcie
                                        </SelectItem>
                                        <SelectItem key="Zakonczona" value="Zakonczona" color="success">
                                            Zakonczona
                                        </SelectItem>
                                    </Select>
                                    <DatePicker 
                                        disableAnimation
                                        className="w-64"
                                        label="Data Rozpoczecia"
                                        name="data_rozpoczecia"
                                        defaultValue={startDate}
                                        onChange={onStartingDateChange}
                                        labelPlacement="outside-left"
                                    />
                                    <DatePicker
                                        disableAnimation
                                        className="w-64"
                                        label="Data Zakończenia"
                                        name="data_zakonczenia"
                                        defaultValue={endDate}
                                        onChange={onEndDateChange}
                                        labelPlacement="outside-left"
                                    />
                                    <Textarea 
                                        className="w-full"
                                        label="Opis usterki"
                                        name="opis_usterki"
                                        defaultValue={obj["opis_usterki"]}
                                        onValueChange={onDescriptionChange}
                                        labelPlacement="outside"
                                        placeholder="brak"
                                    />
                                    <Textarea 
                                        className="w-full"
                                        label="Protokół naprawy"
                                        name="protokol_naprawy"
                                        defaultValue={obj["protokol_naprawy"]}
                                        onValueChange={onDescriptionChange}
                                        labelPlacement="outside"
                                        placeholder="brak"
                                    />
                                    <Popover placement="right-end">
                                        <PopoverTrigger>
                                            <Button variant="bordered" className="w-min">
                                                Pojazd
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div className="m-2 flex flex-col gap-2">
                                                <p>{obj["pojazd"]["vin"]}</p>
                                                <p>{obj["pojazd"]["rejestracja"]}</p>
                                                <p>{obj["pojazd"]["marka"] + " " + obj["pojazd"]["model"] + " " + obj["pojazd"]["rocznik"]}</p>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
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
            
            <Modal isOpen={newModal.isOpen} onOpenChange={newModal.onOpenChange} scrollBehavior="outside" size="sm">
                <ModalContent>
                    {(onClose) => (
                        <Form onSubmit={onSubmit} autoComplete="off">
                            <ModalHeader className="flex flex-col gap-1">{modalHeader}</ModalHeader>
                            <ModalBody className="w-full">
                                <p>Podaj naprawę, do której chcesz się zgłosić:</p>
                                <Input 
                                    className="w-36"
                                    label="ID naprawy"
                                    name="naprawaID"
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