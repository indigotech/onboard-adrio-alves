import dotenv from 'dotenv';
import { setupServer } from './app';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

setupServer();
