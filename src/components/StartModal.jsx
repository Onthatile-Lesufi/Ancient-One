import { useState } from 'react';
import { Modal, Container, Row, Col, Button, Form } from 'react-bootstrap';

const StartModal = ({ passThrough, onHide, ...props }) => {
    const [playerCount, setPlayerCount] = useState(1);

    const handleSubmit = () => {
        if (passThrough) {
            passThrough(Number(playerCount));
        }
        if (onHide) {
            onHide();
        }
    };

    return (
        <Modal {...props} onHide={onHide} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    New Game
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="grid-example">
                <Form.Control 
                    type='number' 
                    placeholder='Player Count' 
                    min={1} 
                    max={6} 
                    value={playerCount}
                    onChange={e => setPlayerCount(e.target.value)}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit}>Submit</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StartModal;