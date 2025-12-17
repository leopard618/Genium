import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-0">
                        © 2025 Genium. Built with Next.js, Convex, and OpenAI.
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Powered by AI</span>
                        <span>•</span>
                        <span>Evolution API</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;