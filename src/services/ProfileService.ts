import { MessageMedia } from 'whatsapp-web.js';
import { whatsAppClientService } from './WhatsAppClientService';
import { Validators, ApiError } from '../utils';
import { logger } from '../config';
import { ISetProfileNameDTO, ISetProfileStatusDTO, ISetProfilePictureDTO, IProfileResponse, IBatteryStatusResponse } from '../models';

export class ProfileService {
  async getProfile(sessionId: string): Promise<IProfileResponse> {
    const client = whatsAppClientService.getClient(sessionId);
    const info = client.info;
    return {
      me: info.me._serialized,
      phone: info.wid.user,
      platform: info.platform,
      pushname: info.pushname,
      wid: info.wid._serialized,
    };
  }

  async setDisplayName(sessionId: string, data: ISetProfileNameDTO): Promise<void> {
    const client = whatsAppClientService.getClient(sessionId);
    await client.setDisplayName(data.displayName);
    logger.info(`Display name updated to ${data.displayName}`);
  }

  async setStatus(sessionId: string, data: ISetProfileStatusDTO): Promise<void> {
    const client = whatsAppClientService.getClient(sessionId);
    await client.setStatus(data.status);
    logger.info(`Status updated`);
  }

  async setProfilePicture(sessionId: string, data: ISetProfilePictureDTO): Promise<void> {
    Validators.validateMediaData(data.media);
    const client = whatsAppClientService.getClient(sessionId);
    const media = new MessageMedia(data.media.mimetype, data.media.data);
    await client.setProfilePicture(media);
    logger.info(`Profile picture updated`);
  }

  async deleteProfilePicture(sessionId: string): Promise<void> {
    const client = whatsAppClientService.getClient(sessionId);
    await client.deleteProfilePicture();
    logger.info(`Profile picture deleted`);
  }

  async getBatteryStatus(sessionId: string): Promise<IBatteryStatusResponse> {
    const client = whatsAppClientService.getClient(sessionId);
    const battery = await client.info.getBatteryStatus();
    return battery;
  }
}

export const profileService = new ProfileService();
