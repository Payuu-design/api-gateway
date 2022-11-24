import { readOne, createOne } from '../helpers/crud.js';
import pool from '../services/db.js';

export async function register (req, res) {
    const { service, url } = req.body;
    if(!service || !url) return res.status(400).json({ message: 'Bad Request' });

    let serviceId;
    try {
        serviceId = (await readOne('service', { 'service': ['id'] }, [], { 'service': service }, pool)).id;
    } catch (err) {
        if(err.message === 'Not found') return res.status(404).json({ message: 'Service not found' });
        return res.status(500).json({ message: 'Internal gateway error' });
    }
    
    try {
        await createOne('node', { service_id: serviceId, url }, pool);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            const serviceIdInstReg = (await readOne(
                'node', { 'node': ['service_id'] }, [], { url }, pool
            )).service_id;
            return res.status(409).json({
                message: serviceIdInstReg === serviceId ? 
                'OK' : 'Url already registered for another service'
            });
        }
        console.log(err);
        return res.status(500).json({ message: 'Internal gateway error' });
    }

    res.status(200).json({ message: 'OK' });
}

export async function unregister (req, res) {
    const { id } = req.params;
    
    try {
        await deleteOne('node', { id }, pool);
    } catch(err) {
        if(err.message === 'Not found') return res.status(404).json({ message: 'Node not found' });
        return res.status(500).json({ message: 'Internal gateway error' });
    }

    res.status(200).json({ message: 'OK' });
}
