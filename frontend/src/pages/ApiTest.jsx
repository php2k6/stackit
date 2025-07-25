import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from 'flowbite-react';
import axios from 'axios';
import config from '../config/config.js';

const ApiTest = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);

    const testEndpoint = async (name, endpoint, needsAuth = true) => {
        try {
            const headers = {};
            if (needsAuth) {
                const token = localStorage.getItem(config.TOKEN_KEY);
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }

            const response = await axios.get(`${config.API_BASE_URL}${endpoint}`, { headers });
            setResults(prev => ({
                ...prev,
                [name]: { success: true, data: response.data, status: response.status }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [name]: { 
                    success: false, 
                    error: error.response?.data?.detail || error.message,
                    status: error.response?.status || 'Network Error'
                }
            }));
        }
    };

    const runTests = async () => {
        setLoading(true);
        setResults({});

        // Test basic endpoints
        await testEndpoint('Home Stats', '/home/stats', false);
        await testEndpoint('Questions', '/question/', true);
        await testEndpoint('User Me', '/user/me', true);
        await testEndpoint('Notifications', '/notification/', true);
        await testEndpoint('All Users (Admin)', '/user/all', true);

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Card className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">API Endpoint Test</h1>
                    <p className="text-gray-600 mb-4">
                        Testing connection to: <code className="bg-gray-100 px-2 py-1 rounded">{config.API_BASE_URL}</code>
                    </p>
                    
                    <Button onClick={runTests} disabled={loading} className="mb-4">
                        {loading ? <Spinner size="sm" className="mr-2" /> : null}
                        Run API Tests
                    </Button>

                    <div className="space-y-4">
                        {Object.entries(results).map(([name, result]) => (
                            <Card key={name} className={`border ${result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{name}</h3>
                                    <span className={`px-2 py-1 rounded text-sm ${result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                        {result.status}
                                    </span>
                                </div>
                                
                                {result.success ? (
                                    <div className="mt-2">
                                        <p className="text-green-700">✅ Success</p>
                                        <pre className="text-xs bg-white p-2 rounded mt-2 max-h-32 overflow-auto">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <p className="text-red-700">❌ Error: {result.error}</p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ApiTest;
