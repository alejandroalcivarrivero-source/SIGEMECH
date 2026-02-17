const axios = require('axios');

const API_URL = 'http://localhost:3002/api'; // Adjust port if necessary

async function testPatientSearch() {
    console.log('Testing Patient Search...');
    try {
        // Use a dummy cedula or one that might exist. 
        // If the endpoint works, it should return a 200 OK even if not found (found: false).
        const response = await axios.get(`${API_URL}/patients/buscar/1717171717`);
        console.log('Patient Search Result:', response.status, response.data);
    } catch (error) {
        console.error('Patient Search Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

async function testSymptomsSearch() {
    console.log('\nTesting Symptoms Search...');
    try {
        const response = await axios.get(`${API_URL}/catalogs/motivos-consulta?search=DOLOR`);
        console.log('Symptoms Search Result:', response.status);
        if (Array.isArray(response.data)) {
            console.log(`Found ${response.data.length} symptoms.`);
            if (response.data.length > 0) {
                console.log('First symptom:', response.data[0]);
            }
        } else {
            console.log('Response is not an array:', response.data);
        }
    } catch (error) {
        console.error('Symptoms Search Failed:', error.message);
        if (error.response) {
             console.error('Response Data:', error.response.data);
        }
    }
}

async function runTests() {
    await testPatientSearch();
    await testSymptomsSearch();
}

runTests();
