import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Typography from '@mui/material/Typography';
interface AvatarModalProps {
    icon1?: string; // Marking it as optional
    labelTitle?: string;
  }
  
  const AvatarModal: React.FC<AvatarModalProps> = ({ icon1, labelTitle }) => {
  
  // State to control the open status of the modal
  const [open, setOpen] = useState(false);

  // Function to handle opening the modal
  const handleOpen = () => setOpen(true);

  // Function to handle closing the modal
  const handleClose = () => setOpen(false);

  // Modal style
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%', // Example width, adjust as needed
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <div>
      {/* Avatar Icon - clicking this will open the modal */}
      {icon1 && <Avatar src={icon1} sx={{ width: 24, height: 24 }} onClick={handleOpen} />}

      {/* Modal Component */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
         <Box sx={style}>
          <Typography id="modal-title" variant="h6" component="h2">
            {labelTitle}
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>
    </div>
  );
}

export default AvatarModal;
