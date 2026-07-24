import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Game.css";
import StartModal from "../components/StartModal";
import TitleBg from "../assets/game_assets/Points_BG.png";
import ExitButton from "../assets/game_assets/Exit_Button.png";
import SectionPanel from "../assets/game_assets/point_key_panel.png";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";

function Game() {
    //#region Declarations
    const Rift = { Name: "rift-square" };
    const Synth = { Name: "synth-square" };
    const Old = { Name: "old-square" };
    const items = ["axe-power-up", "bones-pick-up", "brew-power-up", "egg-pick-up", "ire-power-up", "rock-marker", "tools-power-up", "blessing-power-up", "x-marker"];
    const navigate = useNavigate();
    
    // Game & Turn State
    const [modalShow, setModalShow] = useState(true);
    const [boardMode, setBoardMode] = useState(true);
    const [turnPhase, setTurnPhase] = useState("move"); // 'move' or 'mine'
    
    const size = 9;
    const [grid, setGrid] = useState(() =>
        Array.from({ length: size }, () =>
            Array.from({ length: size }, () => ({ Name: "synth-square", overlay: null, isGlowing: false }))
        )
    );
    
    // Players & Mechanics State
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [blessingUsed, setBlessingUsed] = useState(false);
    const [skipPlayer, setSkipPlayer] = useState(-1);
    const [pickaxeCharges, setPickaxeCharges] = useState(0); // Tracks remaining pickaxe target clicks
    
    // Modals State
    const [ireState, setIreState] = useState(null); // { casterId, itemIndex }
    const [stealingState, setStealingState] = useState(null);
    const [addItemTarget, setAddItemTarget] = useState(null);

    const spawnPoints = [
        { row: 5, col: 2 },
        { row: 4, col: 3 },
        { row: 3, col: 4 },
        { row: 2, col: 5 },
        { row: 6, col: 1 },
        { row: 1, col: 6 },
    ];
    //#endregion

    //#region Grid & Setup Functions
    const updateCell = (rowIndex, colIndex, newBlock, overlay = undefined, isGlowing = undefined) => {
        setGrid(prevGrid =>
            prevGrid.map((row, rIdx) =>
                rIdx === rowIndex
                    ? row.map((cell, cIdx) => {
                        if (cIdx === colIndex) {
                            return {
                                ...cell,
                                Name: newBlock ? newBlock.Name : cell.Name,
                                overlay: overlay !== undefined ? overlay : cell.overlay,
                                isGlowing: isGlowing !== undefined ? isGlowing : cell.isGlowing
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

    // End Setup Mode: Randomly selects 1 to 3 surrounding tiles around each placed rock to glow (excluding Rift tiles)
    const finishSetup = () => {
        const glowCoords = new Set();

        grid.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell.overlay === "rock-marker") {
                    const neighbors = [];
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const nr = rIdx + dr;
                            const nc = cIdx + dc;
                            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                                const targetCell = grid[nr][nc];
                                if (
                                    targetCell.overlay !== "rock-marker" && 
                                    targetCell.overlay !== "portal-marker" && 
                                    targetCell.Name !== Rift.Name
                                ) {
                                    neighbors.push(`${nr},${nc}`);
                                }
                            }
                        }
                    }

                    if (neighbors.length > 0) {
                        const countToGlow = Math.min(neighbors.length, Math.floor(Math.random() * 3) + 1);
                        const shuffled = [...neighbors].sort(() => 0.5 - Math.random());
                        for (let i = 0; i < countToGlow; i++) {
                            glowCoords.add(shuffled[i]);
                        }
                    }
                }
            });
        });

        // Apply glow properties across grid
        setGrid(prevGrid =>
            prevGrid.map((row, rIdx) =>
                row.map((cell, cIdx) => ({
                    ...cell,
                    isGlowing: glowCoords.has(`${rIdx},${cIdx}`)
                }))
            )
        );

        setBoardMode(false);
        setTurnPhase("move");
    };

    const SetRandomTile = (row, col) => {
        const _overlay = "rock-marker";
        updateCell(row, col, null, _overlay);
    };
    //#endregion

    //#region Player & Turn Management
    const AddPlayers = (count) => {
        const playerColors = ["#E63946", "#1D3557", "#2A9D8F", "#F4A261", "#9C27B0", "#00BCD4"];

        const newPlayers = Array.from({ length: count }, (_, i) => ({
            id: i,
            name: `P${i + 1}`,
            score: 0,
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

    const UpdatePlayerEnergy = (id, amount) => {
        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === id ? { ...p, energy: Math.max(0, p.energy + amount) } : p
            )
        );
    };

    const GivePlayerItem = (playerId, item) => {
        setPlayers(prevPlayers =>
            prevPlayers.map(p => {
                if (p.id !== playerId) return p;

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

    const advanceTurn = () => {
        setPickaxeCharges(0); // Reset pickaxe mode on turn end

        if (blessingUsed) {
            setBlessingUsed(false);
            setTurnPhase("move");
        } else {
            let nextIndex = (currentPlayerIndex + 1) % players.length;

            if (players[nextIndex]?.id === skipPlayer) {
                alert(`${players[nextIndex].name}'s turn was skipped by Ancient One's Ire!`);
                nextIndex = (nextIndex + 1) % players.length;
                setSkipPlayer(-1);
            }

            setCurrentPlayerIndex(nextIndex);
            setTurnPhase("move");
        }
    };

    const handleSkipPhase = () => {
        if (turnPhase === "move") {
            setTurnPhase("mine"); // Jump directly to mining phase
        } else if (turnPhase === "mine") {
            advanceTurn(); // Skip mining phase and pass turn
        }
    };

    const handleCellClick = (row, col) => {
        if (players.length === 0) return;

        if (boardMode) {
            SetRandomTile(row, col);
            return;
        }

        const targetCell = grid[row][col];

        // ANCIENT PICKAXE MANUAL TARGETING MODE
        if (pickaxeCharges > 0) {
            if (
                targetCell.overlay === "portal-marker" || 
                targetCell.overlay === "x-marker" || 
                targetCell.Name === Rift.Name
            ) {
                alert("Cannot mine portals, rift tiles, or already mined squares!");
                return;
            }

            if (targetCell.overlay === "rock-marker") {
                const replacementItem = Math.random() < 0.5 ? "egg-pick-up" : "bones-pick-up";
                updateCell(row, col, null, replacementItem, false);
            } else {
                updateCell(row, col, null, "x-marker", false);
            }

            setPickaxeCharges(prev => prev - 1);
            return;
        }

        const activePlayer = players[currentPlayerIndex];

        // PHASE 1: MOVE PHASE
        if (turnPhase === "move") {
            movePlayer(activePlayer.id, row, col);

            if (
                targetCell.overlay && 
                targetCell.overlay !== "portal-marker" && 
                targetCell.overlay !== "rock-marker" && 
                targetCell.overlay !== "x-marker"
            ) {
                GivePlayerItem(activePlayer.id, targetCell.overlay);
                updateCell(row, col, null, null);
            }

            setTurnPhase("mine");

        // PHASE 2: MINE PHASE
        } else if (turnPhase === "mine") {
            if (
                targetCell.overlay === "rock-marker" || 
                targetCell.overlay === "portal-marker" || 
                targetCell.overlay === "x-marker"
            ) {
                alert("Cannot mine rocks, portals, or already mined squares!");
                return;
            }

            // Place X marker on mined tile and advance turn
            updateCell(row, col, null, "x-marker", false);
            advanceTurn();
        }
    };
    //#endregion

    //#region Power-Ups & Actions
    const UseItem = (playerId, itemIndex) => {
        // Enforce turn restriction: only the active player can use items on their turn
        if (playerId !== players[currentPlayerIndex]?.id) {
            alert("You can only use items during your turn!");
            return;
        }

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
                if (players.length <= 1) {
                    alert("No other players to target!");
                    return;
                }
                setIreState({ casterId: playerId, itemIndex });
                return;

            case "axe-power-up":
                setPickaxeCharges(4);
                break;

            case "tools-power-up":
                const otherPlayersWithItems = players.filter(
                    p => p.id !== playerId && p.items.length > 0
                );
                if (otherPlayersWithItems.length === 0) {
                    alert("No other players have items or eggs to steal!");
                    return;
                }
                setStealingState({ thiefId: playerId, toolsIndex: itemIndex });
                return;

            default:
                break;
        }

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

    const ApplyIre = (targetPlayerId) => {
        if (!ireState) return;
        const { casterId, itemIndex } = ireState;

        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === casterId
                    ? {
                        ...p,
                        energy: p.energy - 5,
                        items: p.items.filter((_, idx) => idx !== itemIndex)
                    }
                    : p
            )
        );

        setSkipPlayer(targetPlayerId);
        setIreState(null);
    };

    const ExecuteSteal = (victimId, stolenItemIndex) => {
        if (!stealingState) return;
        const { thiefId, toolsIndex } = stealingState;

        setPlayers(prevPlayers => {
            const victim = prevPlayers.find(p => p.id === victimId);
            if (!victim) return prevPlayers;

            const stolenItem = victim.items[stolenItemIndex];

            let scoreDelta = 0;
            if (stolenItem === "bones-pick-up") scoreDelta = 1;
            if (stolenItem === "egg-pick-up") scoreDelta = 2;

            return prevPlayers.map(p => {
                if (p.id === thiefId) {
                    const updatedItems = p.items.filter((_, idx) => idx !== toolsIndex);
                    return {
                        ...p,
                        energy: p.energy - 10,
                        score: p.score + scoreDelta,
                        items: [...updatedItems, stolenItem]
                    };
                }
                if (p.id === victimId) {
                    return {
                        ...p,
                        score: Math.max(0, p.score - scoreDelta),
                        items: p.items.filter((_, idx) => idx !== stolenItemIndex)
                    };
                }
                return p;
            });
        });

        setStealingState(null);
    };
    //#endregion

    useEffect(() => {
        BoardSetup();
    }, []);

    return (
        <div className="screen-container font-jersey">
            <div className="game-container">
                <div className="grid-container">
                    <div className="grid grid-cols-1 justify-items-center">
                        {boardMode ? 
                            <button className="h-10 w-25 grid items-center justify-items-center text-center mb-2 cursor-pointer border-0 bg-transparent" onClick={finishSetup}>
                                <img src={TitleBg} className="w-full h-full m-auto relative" alt="Title"/>
                                <p className="absolute m-0 text-white font-bold">Finish Setup</p>
                            </button>
                        :
                            <>
                                <div className="w-88 h-24 grid items-center justify-items-center text-center mb-2">
                                    <img src={TitleBg} className="w-full h-full m-auto relative" alt="Title"/>
                                    <h2 className="absolute">
                                        {pickaxeCharges > 0
                                            ? `${players[currentPlayerIndex]?.name} - PICKAXE (${pickaxeCharges} MINES LEFT)`
                                            : players.length > 0
                                            ? `${players[currentPlayerIndex]?.name} - ${turnPhase.toUpperCase()} PHASE`
                                            : "Round "}
                                    </h2>
                                </div>
                                <div className="w-full flex justify-center gap-3 mb-2">
                                    {/* PICKAXE DONE BUTTON */}
                                    {pickaxeCharges > 0 && (
                                        <button 
                                            className="w-[8rem] h-10 grid items-center justify-items-center text-center cursor-pointer border-0 bg-transparent" 
                                            onClick={() => setPickaxeCharges(0)}
                                        >
                                            <img src={TitleBg} className="w-full h-full m-auto relative" alt="Button"/>
                                            <p className="absolute m-0 text-amber-300 font-bold">Done Mining</p>
                                        </button>
                                    )}

                                    {/* DYNAMIC SKIP PHASE BUTTON */}
                                    {turnPhase === "move" && pickaxeCharges === 0 && (
                                        <button 
                                            className="w-[8rem] h-10 grid items-center justify-items-center text-center cursor-pointer border-0 bg-transparent" 
                                            onClick={handleSkipPhase}
                                        >
                                            <img src={TitleBg} className="w-full h-full m-auto relative" alt="Button"/>
                                            <p className="absolute m-0 text-amber-300 font-bold">Skip Move</p>
                                        </button>
                                    )}
                                    {turnPhase === "mine" && pickaxeCharges === 0 && (
                                        <button 
                                            className="w-[8rem] h-10 grid items-center justify-items-center text-center cursor-pointer border-0 bg-transparent" 
                                            onClick={handleSkipPhase}
                                        >
                                            <img src={TitleBg} className="w-full h-full m-auto relative" alt="Button"/>
                                            <p className="absolute m-0 text-amber-300 font-bold">Skip Mine</p>
                                        </button>
                                    )}

                                    {/* END TURN BUTTON */}
                                    <button 
                                        className="w-[8rem] h-10 grid items-center justify-items-center text-center cursor-pointer border-0 bg-transparent" 
                                        onClick={advanceTurn}
                                    >
                                        <img src={TitleBg} className="w-full h-full m-auto relative" alt="Button"/>
                                        <p className="absolute m-0 text-white">End Turn</p>
                                    </button> 

                                    {/* END GAME BUTTON */}
                                    <button 
                                        className="w-[8rem] h-10 grid items-center justify-items-center text-center cursor-pointer border-0 bg-transparent"  
                                        onClick={() => navigate('/score', { state: { players } })}
                                    >
                                        <img src={TitleBg} className="w-full h-full m-auto relative" alt="Button"/>
                                        <p className="absolute m-0 text-white">End Game</p>
                                    </button>
                                </div>
                            </>  
                        }
                    </div>

                    {/* BOARD GRID TABLE */}
                    <table className="game-grid">
                        <tbody>
                            {grid.map((row, rIdx) => (
                                <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                        <td
                                            key={cIdx}
                                            onClick={() => handleCellClick(rIdx, cIdx)}
                                            className={`interactive-cell ${cell.Name}`}
                                            style={cell.isGlowing ? {
                                                boxShadow: "inset 0 0 15px #f59e0b, 0 0 10px #f59e0b",
                                                borderColor: "#fbbf24"
                                            } : {}}
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

                {/* SIDEBAR PLAYER PROGRESS */}
                <div className="px-1.5 py-5 grid grid-cols-1 justify-items-center">
                    <img className="absolute h-[92vh] w-[30vw]" src={SectionPanel} alt="Panel"/>
                    <div className="relative">
                        <div className="w-[23rem] h-[7.5rem] grid items-center justify-items-center text-center mb-3">
                            <img src={TitleBg} className="h-full w-full m-auto relative" alt="Header"/>
                            <h2 className="absolute m-0">Player Progress</h2>
                        </div>

                        {players.map(player => (
                            <div className="outline-1 outline-ancient-one-pink bg-[#0044ff4e] px-3 py-2 mb-2" key={player.id}>
                                <div>
                                    <h3 className="m-0">
                                        <span style={{ color: player.color }}>● </span>
                                        {player.name} | {player.energy} Energy{" "}
                                        <button className="btn btn-sm btn-dark py-0 px-1 ms-1" onClick={() => UpdatePlayerEnergy(player.id, 1)}>+</button>
                                        <button className="btn btn-sm btn-dark py-0 px-1 ms-1" onClick={() => UpdatePlayerEnergy(player.id, -1)}>-</button>
                                    </h3>
                                    <h4 className="m-0">Score: {player.score}</h4>
                                </div>
                                <div>
                                    <p className="m-0">
                                        <strong>Items: </strong>
                                        <button 
                                            className="ms-2 px-1 py-0 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded cursor-pointer border-0"
                                            onClick={() => setAddItemTarget(player)}
                                        >
                                            + Add
                                        </button>
                                        <br/>
                                        {player.items.length > 0 ? (
                                            player.items.map((item, idx) => {
                                                const firstWord = item.split('-')[0];
                                                return item !== "bones-pick-up" && item !== "egg-pick-up" ? (
                                                    <span 
                                                        key={idx} 
                                                        className="badge bg-primary me-1 capitalize cursor-pointer" 
                                                        title={`Click to use ${item}`}
                                                        onClick={() => UseItem(player.id, idx)}
                                                    >
                                                        {firstWord} ✕
                                                    </span>
                                                ) : (
                                                    <span 
                                                        key={idx} 
                                                        className="badge bg-warning text-black me-1 capitalize"
                                                    >
                                                        {firstWord}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span>None</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR / RULES */}
            <div className="w-full flex items-center justify-between px-35 py-4">
                <div className="h-20 w-64 relative flex items-center justify-center text-center">
                    <img src={TitleBg} alt="Points BG" className="w-full h-full absolute inset-0 object-contain"/>
                    <h2 className="relative z-10 text-sm">Points and Keys</h2>
                </div>

                <div className="flex items-center gap-8">
                    <div>
                        <p className="mb-2"><strong>Time Travelers Brew</strong> 1 Use (2 Energy)<br />You can cross the centre line</p>
                        <p><strong>Ancient Pickaxe</strong> 1 Use (4 Energy)<br />Choose 4 Squares to Mine</p>
                    </div>
                    <div>
                        <p className="mb-2"><strong>Ancient One’s Blessing</strong> 1 Use (6 Energy)<br />Take Another Turn</p>
                        <p><strong>Ancient One’s Ire</strong> 1 Use (5 Energy)<br />Another Player Skips Their Turn</p>
                    </div>
                    <div>
                        <p><strong>Thief’s Tools</strong> 1 Use (10 Energy)<br />Steal another player's Item or Egg</p>
                    </div>
                </div>

                <img 
                    onClick={() => navigate('/')} 
                    src={ExitButton} 
                    alt="Exit" 
                    className="w-51 cursor-pointer hover:scale-105 transition-transform"
                />
            </div>

            {/* ADD ITEM TO PLAYER MODAL */}
            <Modal show={addItemTarget !== null} onHide={() => setAddItemTarget(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="font-jersey text-black">
                        Add Item to <span style={{ color: addItemTarget?.color }}>{addItemTarget?.name}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="font-jersey">
                    <p className="text-black mb-3">Select an item to give to {addItemTarget?.name}:</p>
                    <div className="d-flex flex-wrap gap-2">
                        {items
                            .filter(item => item !== "rock-marker" && item !== "x-marker")
                            .map((item, idx) => {
                                const itemName = item
                                    .split('-')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');

                                return (
                                    <button
                                        key={idx}
                                        className="btn btn-outline-primary font-jersey"
                                        onClick={() => {
                                            GivePlayerItem(addItemTarget.id, item);
                                            setAddItemTarget(null);
                                        }}
                                    >
                                        + {itemName}
                                    </button>
                                );
                            })}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary font-jersey" onClick={() => setAddItemTarget(null)}>
                        Cancel
                    </button>
                </Modal.Footer>
            </Modal>

            {/* ANCIENT ONE'S IRE TARGET MODAL */}
            <Modal show={ireState !== null} onHide={() => setIreState(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="font-jersey text-black">Ancient One’s Ire: Choose Player to Skip</Modal.Title>
                </Modal.Header>
                <Modal.Body className="font-jersey">
                    <p className="text-black">Select a player to skip their next turn:</p>
                    <div className="d-flex flex-column gap-2">
                        {players
                            .filter(p => p.id !== ireState?.casterId)
                            .map(p => (
                                <button
                                    key={p.id}
                                    className="btn btn-outline-danger font-jersey"
                                    onClick={() => ApplyIre(p.id)}
                                >
                                    Skip <strong style={{ color: p.color }}>{p.name}</strong>'s Turn
                                </button>
                            ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary font-jersey" onClick={() => setIreState(null)}>
                        Cancel
                    </button>
                </Modal.Footer>
            </Modal>

            {/* THIEF'S TOOLS STEAL MODAL */}
            <Modal show={stealingState !== null} onHide={() => setStealingState(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="font-jersey text-black">Thief's Tools: Choose an Item to Steal</Modal.Title>
                </Modal.Header>
                <Modal.Body className="font-jersey">
                    {players
                        .filter(p => p.id !== stealingState?.thiefId && p.items.length > 0)
                        .map(victim => (
                            <div key={victim.id} className="mb-3 p-2 border rounded">
                                <h5 style={{ color: victim.color }}>{victim.name}'s Items:</h5>
                                <div>
                                    {victim.items.map((item, idx) => (
                                        <button
                                            key={idx}
                                            className="btn btn-sm btn-outline-warning me-2 mb-1 font-jersey text-black"
                                            onClick={() => ExecuteSteal(victim.id, idx)}
                                        >
                                            Steal {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary font-jersey" onClick={() => setStealingState(null)}>
                        Cancel
                    </button>
                </Modal.Footer>
            </Modal>

            {/* START GAME MODAL */}
            <StartModal show={modalShow} onHide={() => setModalShow(false)} passThrough={AddPlayers} />
        </div>
    );
}

export default Game;