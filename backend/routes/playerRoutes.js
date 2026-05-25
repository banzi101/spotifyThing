const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/current', playerController.getCurrent);
router.get('/state', playerController.getPlaybackState);
router.put('/play', playerController.play);
router.put('/pause', playerController.pause);
router.post('/next', playerController.skipNext);
router.post('/previous', playerController.skipPrevious);

module.exports = router;
