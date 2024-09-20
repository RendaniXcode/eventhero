"use client";

import { useState } from 'react';

export default function ComingSoon() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: ''
    });
    const [message, setMessage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Check if email exists in the database
    const checkIfEmailExists = async (email: string) => {
        const query = `
            query GetNotifymedb($CustomerID: String!) {
                getNotifymedb(CustomerID: $CustomerID) {
                    CustomerID
                }
            }
        `;

        const response = await fetch(process.env.NEXT_PUBLIC_APPSYNC_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
            },
            body: JSON.stringify({
                query: query,
                variables: { CustomerID: email },
            }),
        });

        const result = await response.json();
        return result.data?.getNotifymedb ? true : false; // Return true if email exists, false otherwise
    };

    // Create a new entry in DynamoDB via AppSync
    const createNotifymedb = async (formData: { name: string; surname: string; email: string }) => {
        const mutation = `
            mutation CreateNotifymedb($input: CreateNotifymedbInput!) {
                createNotifymedb(input: $input) {
                    CustomerID
                    Name
                    Surname
                    Email
                }
            }
        `;

        const input = {
            CustomerID: formData.email,
            Name: formData.name,
            Surname: formData.surname,
            Email: formData.email,
        };

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_APPSYNC_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: { input },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                console.error('Error:', result.errors);
                setMessage("Something went wrong. Please try again.");
                return null;
            }

            setMessage("Thank you, we will notify you prior to the launch!");
            console.log('Success:', result.data);
            return result.data;
        } catch (error) {
            console.error('Error creating record:', error);
            setMessage("Something went wrong. Please try again.");
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if email already exists
        const emailExists = await checkIfEmailExists(formData.email);

        if (emailExists) {
            setMessage("This email is already being used. We will notify you prior to the launch. Thank you!");
        } else {
            await createNotifymedb(formData);
        }

        // Clear the form after 5 seconds
        setTimeout(() => {
            setFormData({ name: '', surname: '', email: '' });
            setMessage(null); // Clear the success message
        }, 5000);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div className="text-center">
                <img
                    src="/logo.png"
                    alt="EventHero Logo"
                    className="mx-auto mb-6"
                    style={{ width: '150px' }}
                />

                <h2 className="text-white text-3xl mt-6">Coming Soon</h2>
                <p className="text-white mt-2">Your gateway to unforgettable events is almost here.</p>

                {/* Display success or error message */}
                {message && (
                    <p className="text-red-500 mt-4 text-sm italic">{message}</p>
                )}

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="mb-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="border p-2 m-2 rounded-md w-64 text-white bg-black"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            name="surname"
                            placeholder="Enter your surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                            className="border p-2 m-2 rounded-md w-64 text-white bg-black"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="border p-2 m-2 rounded-md w-64 text-white bg-black"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-red-500 text-white p-2 m-2 rounded-md w-64"
                    >
                        Notify Me
                    </button>
                </form>
            </div>
        </div>
    );
}
