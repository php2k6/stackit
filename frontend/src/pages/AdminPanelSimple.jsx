import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from 'flowbite-react';
import { toast } from 'react-hot-toast';
import config from '../config/config';

const AdminPanel = () => {
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState('No data yet');

    useEffect(() => {
        console.log('AdminPanel: Simple version mounted');
        
        // Simulate loading
        setTimeout(() => {
            setTestData('Test data loaded successfully');
            setLoading(false);
            console.log('AdminPanel: Loading completed');
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Spinner size="xl" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel - Simple Version</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Testing admin panel rendering</p>
                </div>

                <Card className="dark:bg-gray-800 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Test Content</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{testData}</p>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                            <h3 className="font-medium text-blue-900 dark:text-blue-100">Debug Information</h3>
                            <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">
                                Component loaded successfully. This proves the routing and basic rendering is working.
                            </p>
                        </div>
                        
                        <Button onClick={() => toast.success('Button clicked!')}>
                            Test Button
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminPanel;
