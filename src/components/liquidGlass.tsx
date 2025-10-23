import React from 'react';

const LiquidGlass: React.FC = () => {
    return (
        <div className="card-wrapper">
            <div className="card-border"></div>
            <div className="card-content flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-2">Join Us Today!</h1>
                <p className="text-xs max-w-[70%]">
                    Experience the liquid frosted glass effect with animated borders
                </p>
            </div>
        </div>
    );
};

export default LiquidGlass;
