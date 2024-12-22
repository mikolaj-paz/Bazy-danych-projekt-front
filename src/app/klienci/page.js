export default async function Klienci() {
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const clients = await response.json();

    return (
        <ul className="space-y-4 p-4">
            {clients.map((user) => (
                <li key={user.id} className="p-4 bg-white shadow-md rounded-lg text-gray-700">
                    {user.name} ({user.email})
                </li>
            ))}
        </ul>
    )
}