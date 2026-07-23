import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Game.css";
import StartModal from "../components/StartModal";
import TitleBg from "../assets/game_assets/Points_BG.png";
import ExitButton from "../assets/game_assets/Exit_Button.png";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

function Game() {
    const Rift = { Name: "rift-square" };
    const Synth = { Name: "synth-square" };
    const Old = { Name: "old-square" };

    const navigate = useNavigate();
    const [modalShow, setModalShow] = useState(true);
    const size = 9;

    const [grid, setGrid] = useState(() =>
        Array.from({ length: size }, () =>
            Array.from({ length: size }, () => ({ Name: "synth-square", overlay: null }))
        )
    );
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const updateCell = (rowIndex, colIndex, newBlock, overlay = undefined) => {
        setGrid(prevGrid =>
            prevGrid.map((row, rIdx) =>
                rIdx === rowIndex
                    ? row.map((cell, cIdx) => {
                        if (cIdx === colIndex) {
                            return {
                                ...cell,
                                Name: newBlock ? newBlock.Name : cell.Name,
                                overlay: overlay !== undefined ? overlay : cell.overlay
                            };
                        }
                        return cell;
                    })
                    : row
            )
        );
    };

    const BoardSetup = () => {
        for (let _i = 0; _i < grid.length; _i++) {
            const _pos = 9 - (_i + 1);
            updateCell(_i, _pos, Rift);

            for (let _n = _pos + 1; _n < grid.length; _n++) {
                updateCell(_i, _n, Old);
            }
        }

        // Place Portal markers at (0,0) and (8,8)
        updateCell(0, 0, null, "portal-marker");
        updateCell(8, 8, null, "portal-marker");
    };

    const spawnPoints = [
        { row: 0, col: 0 },
        { row: 0, col: 8 },
        { row: 8, col: 0 },
        { row: 8, col: 8 },
        { row: 0, col: 4 },
        { row: 8, col: 4 },
    ];

    const AddPlayers = (count) => {
        const playerColors = ["#E63946", "#1D3557", "#2A9D8F", "#F4A261", "#9C27B0", "#00BCD4"];

        const newPlayers = Array.from({ length: count }, (_, i) => ({
            id: i,
            name: `P${i + 1}`,
            row: spawnPoints[i % spawnPoints.length].row,
            col: spawnPoints[i % spawnPoints.length].col,
            color: playerColors[i % playerColors.length],
            energy: 0,
            items: []
        }));

        setPlayers(newPlayers);
        setCurrentPlayerIndex(0);
    };

    const movePlayer = (playerId, newRow, newCol) => {
        if (newRow === 0 && newCol === 0) {
            newRow = 8;
            newCol = 8;
        } else if (newRow === 8 && newCol === 8) {
            newRow = 0;
            newCol = 0;
        }

        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === playerId ? { ...p, row: newRow, col: newCol } : p
            )
        );
    };

    // FIXED: Safe state calculation and non-negative energy check
    const UpdatePlayerEnergy = (id, amount) => {
        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === id ? { ...p, energy: Math.max(0, p.energy + amount) } : p
            )
        );
    };

    const handleCellClick = (row, col) => {
        if (players.length === 0) return;

        const activePlayer = players[currentPlayerIndex];
        movePlayer(activePlayer.id, row, col);
        setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    };

    useEffect(() => {
        BoardSetup();
    }, []);

    return (
        <div className="screen-container">
            <div className="game-container">
                <div className="grid-container">
                    <h2>
                        {players.length > 0
                            ? `Current Turn: ${players[currentPlayerIndex]?.name} `
                            : "Round "}
                        <Button onClick={() => navigate('/score')}>End Game</Button>
                    </h2>

                    <table className="game-grid">
                        <tbody>
                            {grid.map((row, rIdx) => (
                                <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                        <td
                                            key={cIdx}
                                            onClick={() => handleCellClick(rIdx, cIdx)}
                                            className={`interactive-cell ${cell.Name}`}
                                        >
                                            {/* OVERLAY LAYER */}
                                            {cell.overlay && (
                                                <div className={`tile-overlay ${cell.overlay}`} />
                                            )}

                                            {/* PLAYER LAYER */}
                                            <div className="player-layer">
                                                {players
                                                    .filter(p => p.row === rIdx && p.col === cIdx)
                                                    .map(player => {
                                                        const isActive = players[currentPlayerIndex]?.id === player.id;
                                                        return (
                                                            <div
                                                                key={player.id}
                                                                className={`player-token ${isActive ? "active-token" : ""}`}
                                                                style={{ backgroundColor: player.color }}
                                                            >
                                                                {player.id + 1}
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FIXED: Player progress list with keys and item rendering */}
                <div className="player-panel">
                    <h2>Player Progress</h2>
                    {players.map(player => (
                        <div key={player.id} className="player-card">
                            <div>
                                <h3>
                                    <span style={{ color: player.color }}>● </span>
                                    {player.name} | {player.energy} Energy{" "}
                                    <Button size="sm" variant="success" onClick={() => UpdatePlayerEnergy(player.id, 1)}>
                                        <strong>+</strong>
                                    </Button>{" "}
                                    <Button size="sm" variant="danger" onClick={() => UpdatePlayerEnergy(player.id, -1)}>
                                        <strong>-</strong>
                                    </Button>
                                </h3>
                            </div>
                            <div>
                                <p style={{ margin: 0 }}>
                                    <strong>Items: <br/></strong>
                                    {player.items.length > 0 ? (
                                        player.items.map((item, idx) => (
                                            <span key={idx} className="badge bg-secondary me-1">
                                                {item}
                                            </span>
                                        ))
                                    ) : (
                                        <span>None</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ position: "relative" }}>
                    <img style={{ position: "absolute" }} src={TitleBg} alt="Points BG" />
                    <h2>Points and Keys</h2>
                </div>
                <div style={{ position: "relative" }}>
                    <p>Time Travellers Brew 1 Use (2 Energy)<br />You can cross the centre line</p>
                    <p>Ancient Pickaxe 1 Use (4 Energy)<br />You Can Search in a 3x3 Area</p>
                    <p>Ancient One’s Blessing 1 Use (6 Energy)<br />Take Another Turn</p>
                    <p>Ancient One’s Ire 1 Use (5 Energy)<br />Another Player Skips Their Turn</p>
                    <p>Thief’s Tools (Placeholder) 1 Use (10 Energy)<br />Steal another player's Item or Egg</p>
                </div>
                <img onClick={() => navigate('/')} src={ExitButton} alt="Exit" style={{ cursor: "pointer" }} />
            </div>

            <StartModal show={modalShow} onHide={() => setModalShow(false)} passThrough={AddPlayers} />
        </div>
    );
}

export default Game;