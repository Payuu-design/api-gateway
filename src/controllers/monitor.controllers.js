import { readMany } from '../helpers/crud.js';
import pool from '../services/db.js';

export default async function (_, res) {
    let services, nodes;

    try {
        services = await readMany(
            'service', { 'service': ['id', 'service', 'enabled', 'node_id'] }, [], {}, pool
        );
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal gateway error' });
    }

    try {
        nodes = await readMany(
            'node', { 'node': ['id', 'url', 'fail_count', 'service_id'] }, [], {}, pool
        );
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal gateway error' });
    }

    res.status(200).json(services.map(service => ({
        ...service,
        nodes: nodes
            .filter(node => node.service_id === service.id)
            .map(node => ({
                id: node.id,
                url: node.url,
                fail_count: node.fail_count
            }))
    })));
}
