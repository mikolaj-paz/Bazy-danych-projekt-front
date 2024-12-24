export default async function Page({ params }) {
    const id = (await params).klientid
    const json = {
        "imie": "Josiane",
        "nazwisko": "Bruen",
        "telefon": "1-640-228-1688 x1391",
        "email": "Ray.Ruecker63@hotmail.com",
        "klientid": "1"
    }

    return <p>{json['imie']}</p>
}