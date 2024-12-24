import Link from "next/link";

export const Menu = () => {
    return (
        <div className="overflow-hidden bg-slate-700">
            <Link className="float-left block text-white text-center p-4"
                  href="/dashboard/naprawy">
                Naprawy
            </Link>
            <Link className="float-left block text-white text-center p-4"
                  href="/dashboard/klienci">
                Klienci
            </Link>
            <Link className="float-left block text-white text-center p-4"
                  href="/dashboard/mechanicy">
                Mechanicy
            </Link>
            <Link className="float-left block text-white text-center p-4"
                  href="/dashboard/klienci">
                Pojazdy
            </Link>
            
        </div>
    )
};