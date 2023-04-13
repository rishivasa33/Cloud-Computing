import { CssBaseline, Grid, ThemeProvider, Container, Typography, TextField, Button, createTheme } from '@mui/material';
import LandingPage from './LandingPage';
import axios from 'axios';
import { useEffect, useState } from 'react';

const theme = createTheme({ palette: { mode: 'dark' } });
const logsApiURL = "https://967z4l5ee5.execute-api.us-east-1.amazonaws.com/prod/getlogs";

export default function Logs() {

    const [messages, setMessages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!isLoaded && messages.length === 0) {
            axios
                .get(logsApiURL)
                .then((response) => {
                    if (response.data.body) {
                        setMessages(response.data.body);
                    }
                    setIsLoaded(true);
                })
                .catch((error) => {
                    console.log(error);
                    setIsLoaded(true);
                });
        }
    }, [isLoaded]);

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CssBaseline />

                <LandingPage />

                <Typography variant="h3" sx={{ margin: 2, whiteSpace: 'nowrap' }}>Log Data</Typography>
                
                <div style={{ height: 400, overflow: 'auto' }}>
                    {messages && messages.length !== 0 && (
                        <Grid container spacing={4} justifyContent="center" >
                            {messages.map((message) => (
                                <Grid item key={message.MessageID.S}>
                                    <Typography variant="subtitle1">Sender: {message.SenderName.S}</Typography>
                                    <Typography variant="subtitle2">Timestamp: {message.Timestamp.S}</Typography>
                                    <Typography variant="subtitle2">Message Status: {message.MessageStatus.S}</Typography>
                                    {message.ReceiverName && (<Typography variant="subtitle2">ReceiverName: {message.ReceiverName.S}</Typography>)}
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </div>

            </Container>
        </ThemeProvider>
    );
}