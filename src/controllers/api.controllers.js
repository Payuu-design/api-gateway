import { readOne, readMany, updateOne, deleteOne } from '../helpers/crud.js';
import pool from '../services/db.js';
import { MAX_FAIL_COUNT } from '../config/constants.js';
import getResourceService from '../helpers/utils.js';
import fetch from '../helpers/fetch.js';

export default async function (req, res) {
    const resource = req.url.split('/')[1];
    const serviceName = getResourceService(resource);
    console.log(resource, serviceName);
    if(!serviceName) return res.status(400).json({ message: 'Bad Request' });
    
    let service, nodes;
    try {
        service = await readOne(
            'service',
            { 'service': ['id', 'enabled', 'node_id'] },
            [],
            { 'service': serviceName },
            pool
        );
    } catch(err) {
        console.log(err);
        if(err.message === 'Not found') return res.status(404).json({ message: 'Service not found' });
        return res.status(500).json({ message: 'Internal gateway error' });
    }
    if(!service.enabled) return res.status(503).json({ message: 'Service unavailable' });
    
    try {
        nodes = await readMany(
            'node',
            { 'node': ['id', 'fail_count', 'url'] },
            [],
            { 'service_id': service.id },
            pool
        );
    } catch(err) {
        return res.status(500).json({ message: 'Internal gateway error' });
    }

    if(!nodes.length) return res.status(500).json({ message: 'Service not working' });
    const newInstIndex = service.node_id ? 
        (nodes.findIndex(inst => inst.id === service.node_id) + 1) % nodes.length : 0;
    const newInst = nodes[newInstIndex];
    
    delete req.headers.host;
    delete req.headers['content-length'];
    delete req.headers['if-none-match'];

    // let response;
    // console.log('fetching', newInst.url + req.url);
    // console.log({
    //     method: req.method,
    //     headers: req.headers,
    //     body: req.body,
    //     timeout: 10000
    // });
    try {
        response = await fetch(newInst.url + req.url, {
            method: req.method,
            headers: req.headers,
            body: req.body,
            timeout: 10000
        })
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: 'Internal gateway error' });

        const fail_count = newInst.fail_count + 1;
        if(fail_count >= MAX_FAIL_COUNT) {
            try {
                await deleteOne('node', { 'id': newInst.id }, pool);
            } catch(err) {}
        } else {
            try {
                await updateOne('node', { 'fail_count': fail_count }, { 'id': newInst.id }, pool);
            } catch(err) {}
        }
        return;
    }
    try {
        await updateOne('service', { 'node_id': newInst.id }, { 'id': service.id }, pool);
        if(newInst.fail_count) { // reset fail_count if it was not 0
            await updateOne('node', { 'fail_count': 0 }, { 'id': newInst.id }, pool);
        }
    } catch(err) {}
    res.status(response.status).json(response.data);
}
