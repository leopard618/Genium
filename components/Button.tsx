"use client";
import React from 'react';

interface ButtonProps {
    title: string;
    onClick: () => void;
}

const Button = ({ title, onClick }: ButtonProps) => {
    return (
        <div>
            <button onClick={onClick}>{title}</button>
        </div>
    );
};

export default Button;