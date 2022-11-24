import pool from '../services/db.js';
import { updateOne } from '../helpers/crud.js';

export default async function (req, res) {
    const { id } = req.params;
    let { value } = req.body;
    if(!id || value !== 0 && value !== 1) {
        return res.status(400).json({ message: 'Bad Request' });
    }

    try {
        await updateOne('service', { enabled: value }, { id }, pool);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal gateway error' });
    }

    res.status(200).json({ message: 'OK' });
}
