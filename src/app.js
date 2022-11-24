import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index.routes.js';
import pool from './services/db.js';

const app = express();

app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

app.get('/', (_, res) => res.status(200).json({
    message: 'Welcome to the Payuu API Gateway',
}));
app.get('/ping', async (_, res) => {
    let result = 'Monitor DB says: ';
    try {
        result += (await pool.query('SELECT "Pong!" AS result'))[0][0].result;
    } catch (err) {
        console.log(err);
        result += 'Cannot connect to DB';
    }
    res.status(200).json({ message: result });
});
app.use(routes);
// app.use((_, res) => res.status(404).json({ message: 'Not Found' }));

export default app;
