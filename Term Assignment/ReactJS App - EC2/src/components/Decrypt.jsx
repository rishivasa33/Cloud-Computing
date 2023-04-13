import { CssBaseline, Grid, ThemeProvider, Container, Typography, TextField, Button, createTheme } from '@mui/material';
import LandingPage from './LandingPage';
import { useState, useEffect } from 'react';
import axios from 'axios';

const theme = createTheme({ palette: { mode: 'dark' } });
const getMessagesApiURL = "https://967z4l5ee5.execute-api.us-east-1.amazonaws.com/prod/getmessages"
const decryptApiURL = "https://967z4l5ee5.execute-api.us-east-1.amazonaws.com/prod/decrypt";

export default function Decrypt() {

    const [messages, setMessages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cipherText, setCipherText] = useState(null);

    useEffect(() => {
        if (!isLoaded && messages.length === 0) {
            axios
                .get(getMessagesApiURL)
                .then((response) => {
                    if (response.data.body.body.Messages) {
                        setMessages(response.data.body.body.Messages);
                        if (response.data.body.body.Messages.length > 0) {
                            setCipherText(JSON.parse(response.data.body.body.Messages[0].Body).ciphertext);
                        }
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
        const cipherTextMessageID = data.get('cipherTextMessageID');
        const key = data.get('key');

        // Create the stringified data in the desired format
        const requestBody = {
            name: name,
            phoneNumber: phoneNumber,
            ciphertext: cipherText,
            key: key
        }

        try {
            const response = await axios.post(
                decryptApiURL,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            // Handle the response from the Lambda function
            console.log(response.data.body);
            if (response.data.body.decryptedtext) {
                alert("Message: " + response.data.body.message + "\n Decrypted PlainText: " + response.data.body.decryptedtext);
            } else {
                alert("Message: " + response.data.body.message);
            }
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

                <Typography variant="h4" sx={{ margin: 2, whiteSpace: 'nowrap' }}>Decrypt Data</Typography>

                {messages.length === 0 && (
                    <Typography variant="body1" sx={{ margin: 2 }}>No messages to decrypt</Typography>
                )}

                <Grid container direction="column" alignItems="center" spacing={2}>
                    {messages && messages.length > 0 && messages.map((message, index) => (
                        <Typography key={index} variant="body1" sx={{ margin: 2 }}>
                            MESSAGES: <br />
                            {"Sender Name: " + JSON.parse(message.Body).name}
                            <br />
                            {"Ciphertext: " + JSON.parse(message.Body).ciphertext}
                        </Typography>
                    ))}

                    {messages && messages.length > 0 && (
                        <form onSubmit={handleSubmit}>
                            <Grid item sx={{ margin: 2 }}>
                                <TextField id="name" name="name" label="Name" variant="outlined" />
                            </Grid>
                            <Grid item sx={{ margin: 2 }}>
                                <TextField id="phoneNumber" name="phoneNumber" label="Phone Number" variant="outlined" />
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
