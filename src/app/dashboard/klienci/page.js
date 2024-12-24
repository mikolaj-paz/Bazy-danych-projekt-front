'use client'

import React from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue, Spinner, Link } 
from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";

export default function Klienci() {
    const [isLoading, setIsLoading] = React.useState(true);

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

    return (
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
                items={list.items}
                loadingContent={<Spinner label="Ładowanie..." />}
            >
                {(item) => (
                    <TableRow 
                        key={item.klientid}
                        as={Link}
                        href={`/dashboard/klienci/${item.klientid}`}
                        className="hover:bg-gray-100 cursor-pointer"
                    >
                        {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}