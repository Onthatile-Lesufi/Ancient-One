import { useState, useEffect } from "react";
import "./css/Game.css";

function Game() {
    const size = 9;
    const [grid, setGrid] = useState(() => 
        Array.from({ length: size }, () =>
            Array.from({ length: size }, () => ({ Name: "Treasure" }))
        )
    );

    const updateCell = (rowIndex, colIndex, newName) => {
        setGrid(prevGrid => 
            prevGrid.map((row, rIdx) => 
                rIdx === rowIndex 
                    ? row.map((cell, cIdx) => cIdx === colIndex ? { ...cell, Name: newName } : cell)
                    : row
            )
        );
    };

    useEffect(() => {
        updateCell(0, 0, "Portal");
        updateCell(8, 8, "Portal");
    }, []);

    return (
        <div className="game-container">
            <div className="grid-container">
                <table className="game-grid">
                    <tbody>
                        {grid.map(row => (
                            <tr>
                                {row.map(index => (
                                    <td>
                                        {index.Name}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div>
                <p>Points and Keys</p>
                <p>Points and Keys</p>
                <p>Points and Keys</p>
                <p>Points and Keys</p>
                <p>Points and Keys</p>
                <p>Points and Keys</p>
            </div>
        </div>
    );
}

export default Game;