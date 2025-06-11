import React from 'react';
import Head from 'next/head';
import { Box, Container } from '@mui/material';

export default function Home() {
  return (
    <>
      <Head>
        <title>Olá mundo</title>
      </Head>
      <Container>
        <Box>
          <h1>Olá mundo</h1>
        </Box>
      </Container>
    </>
  );
}
