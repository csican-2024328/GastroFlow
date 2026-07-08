import "dotenv/config";
import dns from 'node:dns';
import { initServer } from './configs/app.js';

dns.setDefaultResultOrder('ipv4first');
initServer();