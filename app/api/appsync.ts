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
        CustomerID: formData.email, // Assuming email is the unique identifier
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
            return null;
        }

        console.log('Success:', result.data);
        return result.data;
    } catch (error) {
        console.error('Error creating record:', error);
        return null;
    }
};
