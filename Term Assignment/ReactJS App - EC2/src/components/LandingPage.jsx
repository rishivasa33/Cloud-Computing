import React from 'react';
import { CssBaseline, Grid, ThemeProvider, Container, Typography, Button, createTheme } from '@mui/material';
import { useNavigate } from "react-router-dom";

const theme = createTheme({ palette: { mode: 'dark' } });

export default function Register() {

    const navigate = useNavigate();

    const handleEncryptClick = () => {
        navigate('/encrypt');
    }

    const handleDecryptClick = () => {
        navigate('/decrypt');
    }
    
    const handleGetLogsClick = () => {
        navigate('/logs');
    }

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CssBaseline />

                <Typography variant="h4" sx={{ margin: 2, whiteSpace: 'nowrap' }}>Symmetric Key Cryptosystem</Typography>
                <Typography variant="h6" sx={{ margin: 2, whiteSpace: 'nowrap' }}>A CSCI 5709 Project by Rishi Vasa (B00902815)</Typography>


                <Grid container sx={{ margin: 4 }} spacing={2} justifyContent="center">
                    <Grid item>
                        <Button type="submit" variant="contained" onClick={handleEncryptClick}>Encrypt</Button>
                    </Grid>

                    <Grid item>
                        <Button type="submit" variant="contained" onClick={handleDecryptClick}>Decrypt</Button>
                    </Grid>

                    <Grid item>
                        <Button type="submit" variant="contained" onClick={handleGetLogsClick}>Get Logs</Button>
                    </Grid>
                </Grid>

            </Container>
        </ThemeProvider>
    );
}