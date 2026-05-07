const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const customerAuth = require('../middleware/customerAuth');

router.post('/', customerAuth, ctrl.createProject);
router.get('/', customerAuth, ctrl.getMyProjects);
router.get('/:projectId', customerAuth, ctrl.getProjectById);
router.put('/:projectId', customerAuth, ctrl.updateProject);
router.delete('/:projectId', customerAuth, ctrl.deleteProject);

router.post('/:projectId/link-order', customerAuth, ctrl.linkOrder);
router.delete('/:projectId/unlink-order', customerAuth, ctrl.unlinkOrder);
router.post('/:projectId/link-labour', customerAuth, ctrl.linkLabour);
router.delete('/:projectId/unlink-labour', customerAuth, ctrl.unlinkLabour);

module.exports = router;
