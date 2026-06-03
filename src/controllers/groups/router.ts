import { Router } from 'express';
import { listGroups, createGroup } from './listAndCreate';
import { getGroupInfo, getGroupParticipants, getGroupInvite } from './groupInfo';
import {
  sendGroupText,
  sendGroupMedia,
  sendGroupAudio,
  sendGroupLocation,
  sendGroupPoll,
  sendGroupContact,
} from './groupMessaging';
import {
  sendGroupInvite,
  updateGroupSubject,
  updateGroupDescription,
  updateGroupPicture,
  updateGroupParticipants,
  updateGroupSettings,
  toggleGroupEphemeral,
  leaveGroup,
} from './groupAdmin';

const router = Router();

router.get('/', listGroups);
router.post('/', createGroup);

router.get('/:groupJid/info', getGroupInfo);
router.get('/:groupJid/participants', getGroupParticipants);
router.get('/:groupJid/invite', getGroupInvite);

router.post('/:groupJid/send-text', sendGroupText);
router.post('/:groupJid/send-media', sendGroupMedia);
router.post('/:groupJid/send-audio', sendGroupAudio);
router.post('/:groupJid/send-location', sendGroupLocation);
router.post('/:groupJid/send-poll', sendGroupPoll);
router.post('/:groupJid/send-contact', sendGroupContact);

router.post('/:groupJid/send-invite', sendGroupInvite);
router.post('/:groupJid/subject', updateGroupSubject);
router.post('/:groupJid/description', updateGroupDescription);
router.post('/:groupJid/picture', updateGroupPicture);
router.post('/:groupJid/participant-updates', updateGroupParticipants);
router.post('/:groupJid/settings', updateGroupSettings);
router.post('/:groupJid/ephemeral', toggleGroupEphemeral);
router.delete('/:groupJid/membership', leaveGroup);

export default router;
