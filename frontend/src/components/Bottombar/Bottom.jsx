import React, { useState, useEffect, useRef } from 'react';
import Pen from '../ShapeColorPen/Pen';
import Shape from '../ShapeColorPen/Shape';
import Color from '../ShapeColorPen/Color';
import Table from '../ShapeColorPen/Table';

const Bottom = ({ tool, setTool, texts, setTexts, color, setColor, strokeWidth, setStrokeWidth, shapeType, setShapeType, tableConfig, setTableConfig, handleUndo, handleRedo }) => {

    const [isMenuVisible, setIsMenuVisible] = useState(true);
    const menuRef = useRef(null);
    const prevToolRef = useRef('pen');

    useEffect(() => {
        const handleGlobalClick = (e) => {
            if (menuRef.current && menuRef.current.contains(e.target)) {
                return;
            }

            if (e.target.tagName === 'CANVAS') {
                if (tool === 'mover') return;
                
                // Agar color tool par the, toh turant bina kisi delay ke purane tool par wapas jao
                if (tool === 'color') {
                    setTool(prevToolRef.current || 'pen');
                }

                setIsMenuVisible(false);
            }
        };

        window.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('touchstart', handleGlobalClick);

        return () => {
            window.removeEventListener('mousedown', handleGlobalClick);
            window.removeEventListener('touchstart', handleGlobalClick);
        };
    }, [tool, setTool]);

    const handleToolClick = (newTool) => {
        if (newTool !== 'color' && tool !== 'color') {
            prevToolRef.current = tool;
        } else if (newTool === 'color' && tool !== 'color') {
            prevToolRef.current = tool;
        }
        setTool(newTool);
        setIsMenuVisible(true);
    };

    return (
        <div>
            <footer className='fixed w-full bottom-3 flex flex-col items-center gap-2 z-20 pointer-events-none'>
                
                {isMenuVisible && (
                  <div ref={menuRef} className="pointer-events-auto">
                    {(tool === "pen" || tool === "brush" || tool === "eraser") && (
                        <Pen tool={tool} setTool={setTool} strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth} />
                    )}
                    {tool === "shape" ? (<Shape shapeType={shapeType} setShapeType={setShapeType} />) : ""}
                    {tool === "color" ? (<Color color={color} setColor={setColor} tool={tool} setTool={setTool} prevToolRef={prevToolRef} />) : ""}
                    {tool === "table" ? (<Table tableConfig={tableConfig} setTableConfig={setTableConfig} />) : ""}
                  </div>
                )}
                <ul className='w-fit px-5 rounded-full bg-white/90 backdrop-blur-md border border-gray-300 py-1.5 flex justify-center gap-1 text-xl shadow-lg pointer-events-auto
                [&>*]:px-2 hover:[&>*]:cursor-pointer active:[&>li]:bg-blue-300 [&>*]:rounded-md'>
                    <li style={{ background: tool === "mover" ? "blue" : "", cursor: "pointer" }} onClick={() => { tool === 'mover' ? handleToolClick('pen') : handleToolClick('mover') }}>
                        <i className="fa-regular fa-hand-pointer"></i>
                    </li>
                    <li onClick={handleUndo}><i className="fa-solid fa-rotate-left"></i></li>
                    <li onClick={handleRedo}><i className="fa-solid fa-rotate-right"></i></li>

                    <li  onClick={() => handleToolClick("pen")} style={{ background: tool === "pen" ? "blue" : "" }}>
                        <i className="fa-solid fa-pencil"></i>
                    </li>
                    <li  onClick={() => handleToolClick("eraser")} style={{ background: tool === "eraser" ? "blue" : "" }}>
                        <i className="fa-solid fa-eraser"></i>
                    </li>
                    <li  onClick={() => handleToolClick("text")} style={{ background: tool === "text" ? "blue" : "" }}>
                        <i className="fa-regular fa-keyboard"></i>
                    </li>
                    <li onClick={() => handleToolClick("shape")} style={{ background: tool === "shape" ? "blue" : "" }}>
                        <i className="fa-solid fa-shapes"></i>
                    </li>
                    <li onClick={() => handleToolClick("color")} style={{ background: tool === "color" ? "blue" : "" }}>
                        <i className="fa-solid fa-palette text-yellow-700"></i>
                    </li>
                    <li onClick={() => handleToolClick("table")} style={{ background: tool === "table" ? "blue" : "" }}>
                        <i className="fa-solid fa-table-cells"></i>
                    </li>
                </ul>

            </footer>
        </div>
    );
};

export default Bottom;