import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

import { setupServer } from './app';

setupServer(+(process.env.PORT || 3000));
