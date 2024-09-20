"use client";

import { useState, useEffect } from 'react';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export default function ComingSoon() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: ''
    });
    const [message, setMessage] = useState<string | null>(null);
    const [apiUrl, setApiUrl] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loadingSecrets, setLoadingSecrets] = useState(true); // Add a loading state for secrets

    // Function to retrieve secrets from AWS Secrets Manager
    const fetchSecrets = async () => {
        const secretArn = "arn:aws:secretsmanager:eu-west-1:211125736899:secret:AppSyncScrects-3kR208";
        const client = new SecretsManagerClient({ region: "eu-west-1" });

        try {
            const response = await client.send(
                new GetSecretValueCommand({
                    SecretId: secretArn,
                    VersionStage: "AWSCURRENT",
                })
            );
            
            // Parse the secret string
            const secrets = JSON.parse(response.SecretString || '{}');

            // Set API URL and API Key from the retrieved secrets
            setApiUrl(secrets.NEXT_PUBLIC_APPSYNC_API_URL);
            setApiKey(secrets.NEXT_PUBLIC_APPSYNC_API_KEY);

        } catch (error) {
            console.error("Error retrieving secrets:", error);
        } finally {
            setLoadingSecrets(false); // Secrets loading complete
        }
    };

    // Use effect to fetch secrets on component mount
    useEffect(() => {
        fetchSecrets();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const checkIfEmailExists = async (email: string) => {
        if (!apiUrl || !apiKey) {
            setMessage("API configuration is missing.");
            return false; // Fail gracefully if secrets are not available
        }

        const query = `
            query GetNotifymedb($CustomerID: String!) {
                getNotifymedb(CustomerID: $CustomerID) {
                    CustomerID
                }
            }
        `;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify({
                    query: query,
                    variables: { CustomerID: email },
                }),
            });

            const result = await response.json();
            return result.data?.getNotifymedb ? true : false;
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };

    const createNotifymedb = async (formData: { name: string; surname: string; email: string }) => {
        if (!apiUrl || !apiKey) {
            setMessage("API configuration is missing.");
            return null;
        }

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
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
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

        if (!apiUrl || !apiKey) {
            setMessage("API configuration is missing.");
            return;
        }

        const emailExists = await checkIfEmailExists(formData.email);

        if (emailExists) {
            setMessage("This email is already being used. We will notify you prior to the launch. Thank you!");
        } else {
            await createNotifymedb(formData);
        }

        setTimeout(() => {
            setFormData({ name: '', surname: '', email: '' });
            setMessage(null);
        }, 5000);
    };

    if (loadingSecrets) {
        return <div>Loading...</div>; // Render a loading message until secrets are fetched
    }

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
