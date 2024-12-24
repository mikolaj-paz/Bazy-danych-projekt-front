'use client'

import React from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue, Spinner, Link } 
from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";

export default function Naprawy() {
    const [isLoading, setIsLoading] = React.useState(true);

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
        <Table
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
                items={list.items}
                loadingContent={<Spinner label="Ładowanie..." />}
            >
                {(item) => (
                    <TableRow 
                        key={item.naprawaid}
                        as={Link}
                        href={`/dashboard/naprawy/${item.naprawaid}`}
                        className="hover:bg-gray-100 cursor-pointer"
                    >
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}