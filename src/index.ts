import { app, setupServer } from './app';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

setupServer();
