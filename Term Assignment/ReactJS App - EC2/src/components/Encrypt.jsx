import { CssBaseline, Grid, ThemeProvider, Container, Typography, TextField, Button, createTheme } from '@mui/material';
import LandingPage from './LandingPage';
import axios from 'axios';
import { useEffect, useState } from 'react';

const theme = createTheme({ palette: { mode: 'dark' } });
const getMessagesApiURL = "https://967z4l5ee5.execute-api.us-east-1.amazonaws.com/prod/getmessages"
const encryptApiURL = "https://967z4l5ee5.execute-api.us-east-1.amazonaws.com/prod/encrypt";

export default function Encrypt() {

    const [messages, setMessages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!isLoaded && messages.length === 0) {
            axios
                .get(getMessagesApiURL)
                .then((response) => {
                    if (response.data.body.body.Messages) {
                        setMessages(response.data.body.body.Messages);
                    }
                    setIsLoaded(true);
                })
                .catch((error) => {
                    console.log(error);
                    setIsLoaded(true);
                });
        }
    }, [isLoaded]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = data.get('name');
        const phoneNumber = data.get('phoneNumber');
        const plaintext = data.get('plaintext');
        const key = data.get('key');

        // Create the stringified data in the desired format
        const requestBody = {
            name: name,
            phoneNumber: phoneNumber,
            plaintext: plaintext,
            key: key
        }

        try {
            const response = await axios.post(
                encryptApiURL,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            alert("Message: " + response.data.body.message + "\nCiphertext: " + response.data.body.ciphertext);
        } catch (error) {
            // Handle the error
            console.error(error);
            alert("Error: " + error);
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CssBaseline />

                <LandingPage />

                <Typography variant="h4" sx={{ margin: 2, whiteSpace: 'nowrap' }}>Encrypt Data</Typography>


                {messages && messages.length !== 0 && (
                    <Typography variant="body1" sx={{ margin: 2 }}>There is already a message on the queue waiting to be decrypted. Please wait.</Typography>
                )}


                <Grid container direction="column" alignItems="center" spacing={2}>
                    {messages.length === 0 && (
                        <form onSubmit={handleSubmit}>
                            <Grid item sx={{ margin: 2 }}>
                                <TextField id="name" name="name" label="Name" variant="outlined" />
                            </Grid>
                            <Grid item sx={{ margin: 2 }}>
                                <TextField id="phoneNumber" name="phoneNumber" label="Phone Number" variant="outlined" />
                            </Grid>
                            <Grid item sx={{ margin: 2 }}>
                                <TextField id="plaintext" name="plaintext" label="Enter plaintext" variant="outlined" multiline rows={4} />
                            </Grid>
                            <Grid item sx={{ margin: 2 }}>
                                <TextField id="key" name="key" label="Key" variant="outlined" />
                            </Grid>
                            <Grid item sx={{ margin: 4 }}>
                                <Button variant="contained" color="primary" type="submit" fullWidth>Submit</Button>
                            </Grid>
                        </form>
                    )}
                </Grid>


            </Container>
        </ThemeProvider>
    );
}