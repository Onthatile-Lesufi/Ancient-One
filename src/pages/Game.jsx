import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Game.css";
import StartModal from "../components/StartModal";
import TitleBg from "../assets/game_assets/Points_BG.png";
import ExitButton from "../assets/game_assets/Exit_Button.png";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";

function Game() {
    //#region Declarations
    const Rift = { Name: "rift-square" };
    const Synth = { Name: "synth-square" };
    const Old = { Name: "old-square" };
    const items = ["axe-power-up","bones-pick-up","brew-power-up","egg-pick-up","ire-power-up","rock-marker","tools-power-up","blessing-power-up"];
    const navigate = useNavigate();
    const [modalShow, setModalShow] = useState(true);
    const [boardMode, setBoardMode] = useState(true);
    const size = 9;
    const [grid, setGrid] = useState(() =>
        Array.from({ length: size }, () =>
            Array.from({ length: size }, () => ({ Name: "synth-square", overlay: null }))
        )
    );
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [blessingUsed, setBlessingUsed] = useState(false);
    const [skipPlayer, setSkipPlayer] = useState(-1);
    const [showIreModal, setShowIreModal] = useState(false);
    const [stealingState, setStealingState] = useState(null);
    const spawnPoints = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 0 },
        { row: 0, col: 2 },
    ];
    //#endregion

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

    const AddPlayers = (count) => {
        const playerColors = ["#E63946", "#1D3557", "#2A9D8F", "#F4A261", "#9C27B0", "#00BCD4"];

        const newPlayers = Array.from({ length: count }, (_, i) => ({
            id: i,
            name: `P${i + 1}`,
            score: 0,
            row: spawnPoints[i % spawnPoints.length].row,
            col: spawnPoints[i % spawnPoints.length].col,
            color: playerColors[i % playerColors.length],
            energy: 10,
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

    const UpdatePlayerEnergy = (id, amount) => {
        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === id ? { ...p, energy: Math.max(0, p.energy + amount) } : p
            )
        );
    };

    const SetRandomTile = (row, col) => {
        const _overlay = items[Math.floor(Math.random() * items.length)];
        updateCell(row, col, null, _overlay);
    };

    const GivePlayerItem = (playerId, item) => {
        setPlayers(prevPlayers =>
            prevPlayers.map(p => {
                if (p.id !== playerId) return p;
            
                // Calculate points granted on pickup
                let scoreBonus = 0;
                if (item === "bones-pick-up") scoreBonus = 1;
                if (item === "egg-pick-up") scoreBonus = 2;
            
                return {
                    ...p,
                    score: p.score + scoreBonus,
                    items: [...p.items, item]
                };
            })
        );
    };

    const handleCellClick = (row, col) => {
        if (players.length === 0) return;

        if (boardMode) {
            SetRandomTile(row, col);
        } else {
            const activePlayer = players[currentPlayerIndex];
            movePlayer(activePlayer.id, row, col);

            const _square = grid[row][col]; 

            if (_square.overlay && _square.overlay !== "portal-marker" && _square.overlay !== "rock-marker") {
                GivePlayerItem(activePlayer.id, _square.overlay);
                updateCell(row, col, null, null);
            }

            if (blessingUsed) {
                setBlessingUsed(false);
            } else {
                let nextIndex = (currentPlayerIndex + 1) % players.length;

                // Check if next player should be skipped by ID
                if (players[nextIndex]?.id === skipPlayer) {
                    alert(`${players[nextIndex].name}'s turn was skipped by Ancient One's Ire!`);
                    nextIndex = (nextIndex + 1) % players.length;
                    setSkipPlayer(-1); // Reset skip flag
                }
            
                setCurrentPlayerIndex(nextIndex);
            }
        }
    };

    const EndTurn = () => {
        if (players.length === 0) return;
        
        setPlayers(prevPlayers =>
            prevPlayers.map(p => ({
                ...p,
                energy: p.energy + 2
            }))
        );

        setCurrentPlayerIndex(0);
    };

    // ANCIENT PICKAXE: Mine 3x3 surrounding grid area
    const MineArea = (player) => {
        const startRow = Math.max(0, player.row - 1);
        const endRow = Math.min(size - 1, player.row + 1);
        const startCol = Math.max(0, player.col - 1);
        const endCol = Math.min(size - 1, player.col + 1);
    
        setGrid(prevGrid =>
            prevGrid.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                    // Check if the tile is within the 3x3 area
                    if (rIdx >= startRow && rIdx <= endRow && cIdx >= startCol && cIdx <= endCol) {
                        
                        // Replace rocks with either an Egg or Bones (50/50 chance)
                        if (cell.overlay === "rock-marker") {
                            const replacementItem = Math.random() < 0.5 ? "egg-pick-up" : "bones-pick-up";
                            return { ...cell, overlay: replacementItem };
                        }
                    }
                    
                    // Keep all other items, markers, and empty tiles in the area unchanged
                    return cell;
                })
            )
        );
    };

    const UseItem = (playerId, itemIndex) => {
        const player = players.find(p => p.id === playerId);
        if (!player) return;

        const item = player.items[itemIndex];
        
        const itemCosts = {
            "brew-power-up": 2,
            "axe-power-up": 4,
            "ire-power-up": 5,
            "blessing-power-up": 6,
            "tools-power-up": 10
        };

        const cost = itemCosts[item] || 0;

        if (player.energy < cost) {
            alert(`Not enough energy! Required: ${cost}, Available: ${player.energy}`);
            return;
        }

        switch (item) {
            case "blessing-power-up":
                setBlessingUsed(true);
                break;

            case "ire-power-up":
                // Filter opponents to see if there are players to target
                if (players.length <= 1) {
                    alert("No other players to target!");
                    return;
                }
                setShowIreModal(true);
                return; // Pause item consumption until target is selected in modal

            case "axe-power-up":
                MineArea(player);
                break;

            case "tools-power-up":
                const otherPlayersWithItems = players.filter(
                    p => p.id !== playerId && p.items.length > 0
                );
                if (otherPlayersWithItems.length === 0) {
                    alert("No other players have items or eggs to steal!");
                    return;
                }
            
                // Open target selection modal
                setStealingState({ thiefId: playerId, toolsIndex: itemIndex });
                return;

            default:
                break;
        }

        // Deduct energy & consume the item
        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === playerId
                    ? {
                        ...p,
                        energy: p.energy - cost,
                        items: p.items.filter((_, idx) => idx !== itemIndex)
                    }
                    : p
            )
        );
    };

    const ApplyIre = (targetPlayerId, itemIndex) => {
        const activePlayer = players[currentPlayerIndex];

        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === activePlayer.id
                    ? {
                        ...p,
                        energy: p.energy - 5,
                        items: p.items.filter((_, idx) => idx !== itemIndex)
                    }
                    : p
            )
        );
    
        // Set skip target and close modal
        setSkipPlayer(targetPlayerId);
        setShowIreModal(false);
    };

    const ExecuteSteal = (victimId, stolenItemIndex) => {
        if (!stealingState) return;
        const { thiefId, toolsIndex } = stealingState;

        setPlayers(prevPlayers => {
            const victim = prevPlayers.find(p => p.id === victimId);
            if (!victim) return prevPlayers;

            const stolenItem = victim.items[stolenItemIndex];

            // Adjust score if an Egg (+2) or Bone (+1) is stolen
            let scoreDelta = 0;
            if (stolenItem === "bones-pick-up") scoreDelta = 1;
            if (stolenItem === "egg-pick-up") scoreDelta = 2;

            return prevPlayers.map(p => {
                if (p.id === thiefId) {
                    // Deduct 10 energy, remove Thief's Tools, add stolen item, add score
                    const updatedItems = p.items.filter((_, idx) => idx !== toolsIndex);
                    return {
                        ...p,
                        energy: p.energy - 10,
                        score: p.score + scoreDelta,
                        items: [...updatedItems, stolenItem]
                    };
                }
                if (p.id === victimId) {
                    // Remove stolen item and deduct score from victim
                    return {
                        ...p,
                        score: Math.max(0, p.score - scoreDelta),
                        items: p.items.filter((_, idx) => idx !== stolenItemIndex)
                    };
                }
                return p;
            });
        });

        // Close the target selection modal
        setStealingState(null);
    };

    useEffect(() => {
        BoardSetup();
    }, []);

    return (
        <div className="screen-container">
            <div className="game-container">
                <div className="grid-container">
                    <h2>
                        {boardMode ? 
                            <Button onClick={() => setBoardMode(false)}>Finish Setup</Button>
                        :
                            <>
                                {players.length > 0
                                ? `Current Turn: ${players[currentPlayerIndex]?.name} `
                                : "Round "}
                                <Button onClick={() => EndTurn()}>End Turn</Button> 
                                {" "}
                                <Button onClick={() => navigate('/score')}>End Game</Button>
                            </>  
                        }
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
                                <h4>Score: {player.score}</h4>
                            </div>
                            <div>
                                <p style={{ margin: 0 }}>
                                    <strong>Items: <br/></strong>
                                    {player.items.length > 0 ? (
                                        player.items.map((item, idx) => 
                                            item !== "bones-pick-up" && item !== "egg-pick-up" ? (
                                                <span 
                                                    key={idx} 
                                                    className="badge bg-primary me-1" 
                                                    style={{ cursor: "pointer" }}
                                                    title="Click to use item"
                                                    onClick={() => UseItem(player.id, idx)}
                                                >
                                                    {item} ✕
                                                </span>
                                            ) : (
                                                <span 
                                                    key={idx} 
                                                    className="badge bg-warning me-1" 
                                                    style={{ color: "black" }}
                                                >
                                                    {item}
                                                </span>
                                            )
                                        )
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
                    <p>Time Travelers Brew 1 Use (2 Energy)<br />You can cross the centre line</p>
                    <p>Ancient Pickaxe 1 Use (4 Energy)<br />You Can Search in a 3x3 Area</p>
                    <p>Ancient One’s Blessing 1 Use (6 Energy)<br />Take Another Turn</p>
                    <p>Ancient One’s Ire 1 Use (5 Energy)<br />Another Player Skips Their Turn</p>
                    <p>Thief’s Tools (Placeholder) 1 Use (10 Energy)<br />Steal another player's Item or Egg</p>
                </div>
                <img onClick={() => navigate('/')} src={ExitButton} alt="Exit" style={{ cursor: "pointer" }} />
            </div>

            {/* ANCIENT ONE'S IRE TARGET MODAL */}
            <Modal show={showIreModal} onHide={() => setShowIreModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Ancient One’s Ire: Choose Player to Skip</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Select a player to skip their next turn:</p>
                    <div className="d-flex flex-column gap-2">
                        {players
                            .filter(p => p.id !== players[currentPlayerIndex]?.id)
                            .map(p => (
                                <Button
                                    key={p.id}
                                    variant="outline-danger"
                                    onClick={() => {
                                        const itemIndex = players[currentPlayerIndex].items.indexOf("ire-power-up");
                                        ApplyIre(p.id, itemIndex);
                                    }}
                                >
                                    Skip <strong style={{ color: p.color }}>{p.name}</strong>'s Turn
                                </Button>
                            ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowIreModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* THIEF'S TOOLS STEAL MODAL */}
            <Modal show={stealingState !== null} onHide={() => setStealingState(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thief's Tools: Choose an Item to Steal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {players
                        .filter(p => p.id !== stealingState?.thiefId && p.items.length > 0)
                        .map(victim => (
                            <div key={victim.id} className="mb-3 p-2 border rounded">
                                <h5 style={{ color: victim.color }}>{victim.name}'s Items:</h5>
                                <div>
                                    {victim.items.map((item, idx) => (
                                        <Button
                                            key={idx}
                                            variant="warning"
                                            size="sm"
                                            className="me-2 mb-1"
                                            onClick={() => ExecuteSteal(victim.id, idx)}
                                        >
                                            Steal {item}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setStealingState(null)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            <StartModal show={modalShow} onHide={() => setModalShow(false)} passThrough={AddPlayers} />
        </div>
    );
}

export default Game;